import asyncio
from datetime import datetime
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
_GMAPS_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

METRO_FARE = 1.75
TRANSFER_WINDOW_SECONDS = 2 * 60 * 60

TRANSIT_MODES = {"BUS", "TRAM", "SUBWAY"}
BIKE_MODES = {"BICYCLE", "BICYCLE_RENTAL"}

_OSM_NOISE = {"service road", "path", "track", "footway", "cycleway", "steps", "origin"}

# Simple dict caches — async functions can't use lru_cache
_geocode_cache: dict[tuple, str] = {}
_traffic_cache: dict[tuple, int] = {}


async def _reverse_geocode(client: httpx.AsyncClient, lat: float, lon: float) -> str | None:
    key = (lat, lon)
    if key in _geocode_cache:
        return _geocode_cache[key]
    if not _GMAPS_KEY:
        return None
    resp = await client.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        params={"latlng": f"{lat},{lon}", "key": _GMAPS_KEY},
        timeout=5,
    )
    results = resp.json().get("results", [])
    if not results:
        return None
    for r in results:
        if "street_address" in r.get("types", []):
            name = r["formatted_address"].split(",")[0]
            _geocode_cache[key] = name
            return name
    name = results[0]["formatted_address"].split(",")[0]
    _geocode_cache[key] = name
    return name


async def _get_traffic_duration(
    client: httpx.AsyncClient,
    from_lat: float, from_lon: float,
    to_lat: float, to_lon: float,
) -> int | None:
    """Returns drive time in seconds with live traffic, or None on failure."""
    key = (from_lat, from_lon, to_lat, to_lon)
    if key in _traffic_cache:
        return _traffic_cache[key]
    if not _GMAPS_KEY:
        return None
    resp = await client.get(
        "https://maps.googleapis.com/maps/api/directions/json",
        params={
            "origin": f"{from_lat},{from_lon}",
            "destination": f"{to_lat},{to_lon}",
            "departure_time": "now",
            "mode": "driving",
            "key": _GMAPS_KEY,
        },
        timeout=5,
    )
    routes = resp.json().get("routes", [])
    if not routes:
        return None
    leg = routes[0].get("legs", [{}])[0]
    duration = leg.get("duration_in_traffic", leg.get("duration", {})).get("value")
    if duration:
        _traffic_cache[key] = duration
    return duration


def _needs_geocode(name: str | None) -> bool:
    return not name or name.lower().strip() in _OSM_NOISE or name.lower().startswith("corner of")


async def _enrich_legs(legs: list[dict]) -> list[dict]:
    """Parallel: geocode noisy names + fetch traffic duration for CAR legs."""
    async with httpx.AsyncClient() as client:

        # Build all async tasks
        geocode_tasks = {}
        traffic_tasks = {}

        for i, leg in enumerate(legs):
            f, t = leg["from"], leg["to"]
            if _needs_geocode(f.get("name")):
                geocode_tasks[("from", i)] = _reverse_geocode(client, f["lat"], f["lon"])
            if _needs_geocode(t.get("name")):
                geocode_tasks[("to", i)] = _reverse_geocode(client, t["lat"], t["lon"])
            if leg.get("mode") == "CAR":
                traffic_tasks[i] = _get_traffic_duration(
                    client, f["lat"], f["lon"], t["lat"], t["lon"]
                )

        # Run everything in parallel
        all_keys = list(geocode_tasks.keys()) + [("traffic", i) for i in traffic_tasks]
        all_coros = list(geocode_tasks.values()) + list(traffic_tasks.values())
        results = await asyncio.gather(*all_coros, return_exceptions=True)
        result_map = {k: v for k, v in zip(all_keys, results)}

        # Apply results
        enriched = []
        for i, leg in enumerate(legs):
            f, t = dict(leg["from"]), dict(leg["to"])

            from_key = ("from", i)
            if from_key in result_map and isinstance(result_map[from_key], str):
                f["name"] = result_map[from_key]

            to_key = ("to", i)
            if to_key in result_map and isinstance(result_map[to_key], str):
                t["name"] = result_map[to_key]

            new_leg = {**leg, "from": f, "to": t}

            traffic_key = ("traffic", i)
            if traffic_key in result_map and isinstance(result_map[traffic_key], int):
                new_leg = {**new_leg, "duration": result_map[traffic_key]}

            enriched.append(new_leg)

    return enriched


def _leg_cost(leg: dict, first_tap_time: datetime | None) -> tuple[float, datetime | None]:
    mode = leg.get("mode", "")
    start_time = datetime.fromisoformat(leg["start"]["scheduledTime"])

    if mode in TRANSIT_MODES | BIKE_MODES:
        if first_tap_time is None:
            return METRO_FARE, start_time
        if (start_time - first_tap_time).total_seconds() > TRANSFER_WINDOW_SECONDS:
            return METRO_FARE, start_time
        return 0.0, first_tap_time

    if mode == "CAR":
        # Waymo LA regression model — duration already replaced with traffic-aware value
        distance_miles = leg.get("distance", 0) / 1609.34
        duration_minutes = leg.get("duration", 0) / 60
        cost = 8.14 + (1.58 * distance_miles) + (0.30 * duration_minutes)
        return round(cost, 2), first_tap_time

    return 0.0, first_tap_time


async def annotate_costs(itinerary: dict) -> dict:
    first_tap_time = None
    total_cost = 0.0
    annotated_legs = []

    legs = await _enrich_legs(itinerary.get("legs", []))

    for leg in legs:
        cost, first_tap_time = _leg_cost(leg, first_tap_time)
        total_cost += cost
        annotated_legs.append({**leg, "cost": cost})

    return {**itinerary, "legs": annotated_legs, "total_cost": round(total_cost, 2)}


async def annotate_plan(plan_connection: dict) -> dict:
    annotated_edges = await asyncio.gather(*[
        _annotate_edge(edge) for edge in plan_connection.get("edges", [])
    ])
    return {**plan_connection, "edges": list(annotated_edges)}


async def _annotate_edge(edge: dict) -> dict:
    return {**edge, "node": await annotate_costs(edge["node"])}
