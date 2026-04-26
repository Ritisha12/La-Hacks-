import asyncio
import json
from PathParsing import annotate_costs

itinerary = {
    "duration": 2344,
    "walkTime": 653,
    "waitingTime": 0,
    "numberOfTransfers": 0,
    "generalizedCost": 4450,
    "start": "2026-04-26T00:13:12-07:00",
    "end": "2026-04-26T00:52:16-07:00",
    "legs": [
        {
            "mode": "WALK", "duration": 193, "distance": 203.51,
            "transitLeg": False, "realTime": False,
            "start": {"scheduledTime": "2026-04-26T00:13:12-07:00"},
            "end":   {"scheduledTime": "2026-04-26T00:16:25-07:00"},
            "from": {"name": "Origin",       "lat": 34.0701004,  "lon": -118.444048},
            "to":   {"name": "service road", "lat": 34.0687534,  "lon": -118.4445945},
            "route": None,
        },
        {
            "mode": "CAR", "duration": 602, "distance": 8862.42,
            "transitLeg": False, "realTime": False,
            "start": {"scheduledTime": "2026-04-26T00:16:25-07:00"},
            "end":   {"scheduledTime": "2026-04-26T00:26:27-07:00"},
            "from": {"name": "service road",                        "lat": 34.0687534,  "lon": -118.4445945},
            "to":   {"name": "corner of path and Sawtelle Boulevard","lat": 34.0116055,  "lon": -118.419852},
            "route": None,
        },
        {
            "mode": "WALK", "duration": 94, "distance": 15.06,
            "transitLeg": False, "realTime": False,
            "start": {"scheduledTime": "2026-04-26T00:26:27-07:00"},
            "end":   {"scheduledTime": "2026-04-26T00:28:01-07:00"},
            "from": {"name": "corner of path and Sawtelle Boulevard", "lat": 34.0116055, "lon": -118.419852},
            "to":   {"name": "Venice / Sawtelle",                     "lat": 34.011555,  "lon": -118.42},
            "route": None,
        },
        {
            "mode": "BUS", "duration": 393, "distance": 3628.8,
            "transitLeg": True, "realTime": True,
            "start": {"scheduledTime": "2026-04-26T00:26:00-07:00"},
            "end":   {"scheduledTime": "2026-04-26T00:34:00-07:00"},
            "from": {"name": "Venice / Sawtelle", "lat": 34.011555, "lon": -118.42},
            "to":   {"name": "Pico / Sepulveda",  "lat": 34.0194,   "lon": -118.4912},
            "route": {"shortName": "33", "longName": "Venice Boulevard"},
        },
    ],
}

result = asyncio.run(annotate_costs(itinerary))
print(json.dumps(result, indent=2))
