from datetime import datetime
from functools import lru_cache
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
_GMAPS_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

METRO_FARE = 1.75
TRANSFER_WINDOW_SECONDS = 2 * 60 * 60

TRANSIT_MODES = {"BUS", "TRAM", "SUBWAY"}
BIKE_MODES = {"BICYCLE", "BICYCLE_RENTAL"}


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
        # Waymo LA regression model: github.com/EwoutH/Waymo-pricing (R²=0.78)
        distance_miles = leg.get("distance", 0) / 1609.34
        duration_minutes = leg.get("duration", 0) / 60
        cost = 8.14 + (1.58 * distance_miles) + (0.30 * duration_minutes)
        return round(cost, 2), first_tap_time

    return 0.0, first_tap_time


_OSM_NOISE = {"service road", "path", "track", "footway", "cycleway", "steps", "origin"}


@lru_cache(maxsize=512)
def _reverse_geocode(lat: float, lon: float) -> str:
    if not _GMAPS_KEY:
        return None
    resp = httpx.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        params={"latlng": f"{lat},{lon}", "key": _GMAPS_KEY},
        timeout=5,
    )
    results = resp.json().get("results", [])
    if not results:
        return None
    for r in results:
        if "street_address" in r.get("types", []):
            return r["formatted_address"].split(",")[0]
    return results[0]["formatted_address"].split(",")[0]


def _clean_name(name: str | None, lat: float, lon: float) -> str:
    if not name or name.lower().strip() in _OSM_NOISE or name.lower().startswith("corner of"):
        return _reverse_geocode(lat, lon) or name
    return name


def _geocode_legs(legs: list[dict]) -> list[dict]:
    result = []
    for leg in legs:
        f = leg["from"]
        t = leg["to"]
        new_from = {**f, "name": _clean_name(f.get("name"), f["lat"], f["lon"])}
        new_to   = {**t, "name": _clean_name(t.get("name"), t["lat"], t["lon"])}
        result.append({**leg, "from": new_from, "to": new_to})
    return result


def annotate_costs(itinerary: dict) -> dict:
    first_tap_time = None
    total_cost = 0.0
    annotated_legs = []

    legs = _geocode_legs(itinerary.get("legs", []))

    for leg in legs:
        cost, first_tap_time = _leg_cost(leg, first_tap_time)
        total_cost += cost
        annotated_legs.append({**leg, "cost": cost})

    return {**itinerary, "legs": annotated_legs, "total_cost": round(total_cost, 2)}


def annotate_plan(plan_connection: dict) -> dict:
    """
    Takes the full OTP planConnection response and returns it in the same
    structure with cost fields added to each itinerary and its legs.
    """
    annotated_edges = [
        {**edge, "node": annotate_costs(edge["node"])}
        for edge in plan_connection.get("edges", [])
    ]
    return {**plan_connection, "edges": annotated_edges}
