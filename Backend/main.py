from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

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

    access_modes = ["WALK"] if prefs.walk else []
    if prefs.car_dropoff:
        access_modes.append("CAR_DROP_OFF")

    egress_modes = ["WALK"] if prefs.walk else []
    if prefs.car_dropoff:
        egress_modes.append("CAR_PICKUP")

    direct_modes = ["WALK"] if prefs.walk else []

    if not transit_modes and not direct_modes:
        raise ValueError("At least one mode must be enabled.")

    lines = ["modes: {"]
    if direct_modes:
        lines.append(f"  direct: [{', '.join(direct_modes)}]")
    if transit_modes:
        lines.append("  transit: {")
        if access_modes:
            lines.append(f"    access: [{', '.join(access_modes)}]")
        if egress_modes:
            lines.append(f"    egress: [{', '.join(egress_modes)}]")
        lines.append(f"    transit: [{', '.join(transit_modes)}]")
        lines.append("  }")
    lines.append("}")
    return "\n    ".join(lines)


class RouteRequest(BaseModel):
    origin: tuple[float, float]
    destination: tuple[float, float]
    preferences: ModePreferences = ModePreferences()


@app.post("/query_routes")
async def query_routes(request: RouteRequest):
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

    routing_errors = data.get("data", {}).get("planConnection", {}).get("routingErrors", [])
    if routing_errors:
        raise HTTPException(status_code=400, detail=routing_errors)

    return data.get("data", {})
