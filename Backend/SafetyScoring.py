import json
import numpy as np
from scipy.spatial import KDTree

HEATMAP_PATH = "heatmap/crime_heatmap.json"

# Walk legs are scored along the full path (most exposed)
# Transit legs are scored at boarding/alighting stops only (protected inside vehicle)
TRANSIT_MODES = {"BUS", "TRAM", "SUBWAY", "RAIL"}
TRANSIT_STOP_WEIGHT = 1.0  # waiting at a stop is as dangerous as walking


def load_heatmap(path: str = HEATMAP_PATH) -> tuple[KDTree, np.ndarray]:
    """
    Loads crime_heatmap.json and returns a KDTree of cell centres
    and a parallel array of intensities for fast lookup.
    """
    with open(path) as f:
        points = json.load(f)

    coords = np.array([[p[0], p[1]] for p in points])
    intensities = np.array([p[2] for p in points])
    return KDTree(coords), intensities


def _lookup(lat: float, lon: float, tree: KDTree, intensities: np.ndarray,
            radius_deg: float = 0.001) -> float:
    """Returns the max heatmap intensity within radius of a point (0.0 if none)."""
    idxs = tree.query_ball_point([lat, lon], radius_deg)
    if not idxs:
        return 0.0
    return float(np.max(intensities[idxs]))


def _sample_path(from_lat, from_lon, to_lat, to_lon, n=5):
    return [
        (from_lat + t * (to_lat - from_lat), from_lon + t * (to_lon - from_lon))
        for t in np.linspace(0, 1, n)
    ]


def score_leg(leg: dict, tree: KDTree, intensities: np.ndarray) -> float:
    """
    Returns a safety score 0.0–1.0 for a leg (1.0 = safest).

    Walk legs: sampled along the full path.
    Transit legs: boarding and alighting stops only, half-weighted.
    CAR/other: 1.0 (protected inside vehicle).
    """
    mode = leg.get("mode", "")
    from_lat = leg["from"]["lat"]
    from_lon = leg["from"]["lon"]
    to_lat = leg["to"]["lat"]
    to_lon = leg["to"]["lon"]

    if mode in {"WALK", "BICYCLE", "BICYCLE_RENTAL"}:
        points = _sample_path(from_lat, from_lon, to_lat, to_lon)
        raw = max(_lookup(lat, lon, tree, intensities, radius_deg=0.002) for lat, lon in points)
    elif mode in TRANSIT_MODES:
        from_score = _lookup(from_lat, from_lon, tree, intensities, radius_deg=0.001)
        to_score = _lookup(to_lat, to_lon, tree, intensities, radius_deg=0.001)
        raw = max(from_score, to_score) * TRANSIT_STOP_WEIGHT
    else:
        return 1.0

    return round(1.0 - raw, 2)


def safest_itinerary(itineraries: list[dict], tree: KDTree, intensities: np.ndarray) -> dict:
    """Returns the single safest itinerary from a list, fully annotated."""
    scored = [annotate_safety(it, tree, intensities) for it in itineraries]
    return max(scored, key=lambda it: it["min_safety_score"])


def annotate_safety(itinerary: dict, tree: KDTree, intensities: np.ndarray) -> dict:
    """
    Adds 'safety_score' to each leg and 'min_safety_score' to the itinerary.
    min_safety_score is the worst leg — used to rank itineraries by safety.
    """
    annotated_legs = [
        {**leg, "safety_score": score_leg(leg, tree, intensities)}
        for leg in itinerary.get("legs", [])
    ]

    scored_legs = [l["safety_score"] for l in annotated_legs
                   if l["mode"] in TRANSIT_MODES | {"WALK", "BICYCLE", "BICYCLE_RENTAL"}]
    min_score = min(scored_legs) if scored_legs else 1.0

    return {**itinerary, "legs": annotated_legs, "min_safety_score": round(min_score, 2)}
