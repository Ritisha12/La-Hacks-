from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from PathParsing import annotate_plan
from SafetyScoring import get_safest

import asyncio
import httpx
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OTP_BASE_URL = os.getenv("OTP_BASE_URL")
OTP_GRAPHQL_URL = f"{OTP_BASE_URL}/otp/gtfs/v1"

PLAN_QUERY_TEMPLATE = """
query PlanRoutes(
  $originLat: CoordinateValue!
  $originLon: CoordinateValue!
  $destLat: CoordinateValue!
  $destLon: CoordinateValue!
) {{
  planConnection(
    origin: {{
      location: {{ coordinate: {{ latitude: $originLat, longitude: $originLon }} }}
    }}
    destination: {{
      location: {{ coordinate: {{ latitude: $destLat, longitude: $destLon }} }}
    }}
    first: 5
    {modes_block}
  ) {{
    routingErrors {{ code description }}
    edges {{
      node {{
        duration
        walkTime
        waitingTime
        numberOfTransfers
        generalizedCost
        start
        end
        legs {{
          mode
          duration
          distance
          transitLeg
          realTime
          start {{ scheduledTime }}
          end   {{ scheduledTime }}
          from  {{ name lat lon }}
          to    {{ name lat lon }}
          route {{ shortName longName }}
        }}
      }}
    }}
  }}
}}
"""


class ModePreferences(BaseModel):
    walk: bool = True
    bus: bool = True
    rail: bool = True
    subway: bool = True
    tram: bool = True
    car_dropoff: bool = True
    bicycle: bool = True
    bicycle_rental: bool = True
    car: bool = True  # pure point-to-point car (Waymo)


def build_modes_block(prefs: ModePreferences) -> str:
    transit_modes = []
    if prefs.bus:
        transit_modes.append("{ mode: BUS }")
    if prefs.rail:
        transit_modes.append("{ mode: RAIL }")
    if prefs.subway:
        transit_modes.append("{ mode: SUBWAY }")
    if prefs.tram:
        transit_modes.append("{ mode: TRAM }")

    # BICYCLE cannot be combined with WALK; BICYCLE_RENTAL must be combined with WALK
    include_walk = prefs.walk and not prefs.bicycle

    access_modes = ["WALK"] if include_walk else []
    if prefs.car_dropoff:
        access_modes.append("CAR_DROP_OFF")
    if prefs.bicycle:
        access_modes.append("BICYCLE")
    if prefs.bicycle_rental:
        access_modes.append("BICYCLE_RENTAL")

    egress_modes = ["WALK"] if include_walk else []
    if prefs.car_dropoff:
        egress_modes.append("CAR_PICKUP")
    if prefs.bicycle:
        egress_modes.append("BICYCLE")
    if prefs.bicycle_rental:
        egress_modes.append("BICYCLE_RENTAL")

    direct_modes = ["WALK"] if include_walk else []
    if prefs.bicycle:
        direct_modes.append("BICYCLE")
    if prefs.bicycle_rental:
        direct_modes.append("BICYCLE_RENTAL")

    if prefs.car:
        direct_modes.append("CAR")

    if not transit_modes and not direct_modes:
        raise ValueError("At least one mode must be enabled.")

    if prefs.bicycle:
        transfer_modes = ["BICYCLE"]
    else:
        transfer_modes = ["WALK"] if prefs.walk else []

    lines = ["modes: {"]
    if direct_modes:
        lines.append(f"  direct: [{', '.join(direct_modes)}]")
    if transit_modes:
        lines.append("  transit: {")
        if access_modes:
            lines.append(f"    access: [{', '.join(access_modes)}]")
        if egress_modes:
            lines.append(f"    egress: [{', '.join(egress_modes)}]")
        if transfer_modes:
            lines.append(f"    transfer: [{', '.join(transfer_modes)}]")
        lines.append(f"    transit: [{', '.join(transit_modes)}]")
        lines.append("  }")
    lines.append("}")
    return "\n    ".join(lines)


def _access_variants(prefs: ModePreferences) -> list[ModePreferences]:
    """Return one ModePreferences per access/egress strategy (walk + at most one vehicle)."""
    base = dict(
        walk=prefs.walk,
        bus=prefs.bus,
        rail=prefs.rail,
        subway=prefs.subway,
        tram=prefs.tram,
        car_dropoff=False,
        bicycle=False,
        bicycle_rental=False,
        car=False,  # car-only route is fetched separately via _fetch_car_route
    )
    variants = [ModePreferences(**base)]
    if prefs.car_dropoff:
        variants.append(ModePreferences(**{**base, "car_dropoff": True}))
    if prefs.bicycle:
        variants.append(ModePreferences(**{**base, "bicycle": True}))
    if prefs.bicycle_rental:
        variants.append(ModePreferences(**{**base, "bicycle_rental": True}))
    return variants


class RouteRequest(BaseModel):
    origin: tuple[float, float]
    destination: tuple[float, float]
    preferences: ModePreferences = ModePreferences()


async def _fetch_plan(request: RouteRequest) -> dict:
    origin_lat, origin_lon = request.origin
    dest_lat, dest_lon = request.destination

    try:
        modes_block = build_modes_block(request.preferences)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    query = PLAN_QUERY_TEMPLATE.format(modes_block=modes_block)

    payload = {
        "query": query,
        "variables": {
            "originLat": origin_lat,
            "originLon": origin_lon,
            "destLat": dest_lat,
            "destLon": dest_lon,
        },
    }

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            response = await client.post(
                OTP_GRAPHQL_URL,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"OTP server unreachable: {e}")

    data = response.json()

    if "errors" in data:
        raise HTTPException(status_code=400, detail=data["errors"])

    plan_connection = data.get("data", {}).get("planConnection", {})
    if plan_connection.get("routingErrors"):
        return {"edges": []}

    return await annotate_plan(plan_connection)


async def _fetch_all_variants(request: RouteRequest) -> list[dict]:
    variants = _access_variants(request.preferences)
    variant_requests = [
        RouteRequest(origin=request.origin, destination=request.destination, preferences=v)
        for v in variants
    ]
    results = await asyncio.gather(*[_fetch_plan(r) for r in variant_requests])

    seen = set()
    nodes = []
    for plan in results:
        for edge in plan.get("edges", []):
            node = edge["node"]
            key = (node.get("start"), node.get("duration"))
            if key not in seen:
                seen.add(key)
                nodes.append(node)

    return nodes


async def _fetch_car_route(request: RouteRequest) -> dict | None:
    """Fetch a single point-to-point car itinerary (no transit)."""
    if not request.preferences.car:
        return None

    car_prefs = ModePreferences(
        walk=False, bus=False, rail=False, subway=False, tram=False,
        car_dropoff=False, bicycle=False, bicycle_rental=False, car=True,
    )
    car_request = RouteRequest(origin=request.origin, destination=request.destination, preferences=car_prefs)
    try:
        plan = await _fetch_plan(car_request)
    except HTTPException:
        return None

    edges = plan.get("edges", [])
    return edges[0]["node"] if edges else None


@app.post("/query_routes")
async def query_routes(request: RouteRequest):
    nodes, car_node = await asyncio.gather(
        _fetch_all_variants(request),
        _fetch_car_route(request),
    )

    if not nodes:
        raise HTTPException(status_code=404, detail="No itineraries found.")

    fastest = min(nodes, key=lambda n: n.get("duration", float("inf")))
    cheapest = min(nodes, key=lambda n: n.get("total_cost", float("inf")))
    safest = get_safest(nodes)
    min_walk = min(nodes, key=lambda n: n.get("walkTime", float("inf")))
    max_walk = max(nodes, key=lambda n: n.get("walkTime", 0))

    return {
        "fastest": fastest,
        "cheapest": cheapest,
        "safest": safest,
        "min_walk": min_walk,
        "max_walk": max_walk,
        "car": car_node,
        "all": nodes,
    }
