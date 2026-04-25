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

PLAN_QUERY = """
query PlanRoutes(
  $originLat: CoordinateValue!
  $originLon: CoordinateValue!
  $destLat: CoordinateValue!
  $destLon: CoordinateValue!
) {
  planConnection(
    origin: {
      location: { coordinate: { latitude: $originLat, longitude: $originLon } }
    }
    destination: {
      location: { coordinate: { latitude: $destLat, longitude: $destLon } }
    }
    first: 5
    modes: {
      direct: [WALK]
      transit: {
        access:  [WALK, CAR_DROP_OFF]
        egress:  [WALK, CAR_PICKUP]
        transit: [
          { mode: BUS }
          { mode: RAIL }
          { mode: SUBWAY }
          { mode: TRAM }
        ]
      }
    }
  ) {
    routingErrors { code description }
    edges {
      node {
        duration
        walkTime
        waitingTime
        numberOfTransfers
        generalizedCost
        start
        end
        legs {
          mode
          duration
          distance
          transitLeg
          realTime
          start { scheduledTime }
          end   { scheduledTime }
          from  { name lat lon }
          to    { name lat lon }
          route { shortName longName }
        }
      }
    }
  }
}
"""

class RouteRequest(BaseModel):
    origin: tuple[float, float]
    destination: tuple[float, float]


@app.post("/query_routes")
async def query_routes(request: RouteRequest):
    origin_lat, origin_lon = request.origin
    dest_lat, dest_lon = request.destination

    payload = {
        "query": PLAN_QUERY,
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
