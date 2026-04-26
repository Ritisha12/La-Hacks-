"""
Builds crime heatmap data from LAPD crime datasets.
Run with: python3 build_heatmap.py
Output: crime_heatmap.json — array of [lat, lon, intensity] points

Intensity uses absolute thresholds (weighted crime score per 100m cell):
  0       → 1.0  safe
  1–5     → 0.75 low risk
  6–15    → 0.5  moderate
  16–30   → 0.25 elevated
  30+     → 0.0  high risk

Data sources:
  - Legacy 2023-2024 (2nrs-mtv8): lat/lon, crm_cd
  - NIBRS 2026-present (k7nn-b2ep): hndrdth_lat/lon, nibr_code
"""

import json
import requests

OUTPUT_FILE = "crime_heatmap.json"
PAGE_SIZE = 50000
GRID_RES = 0.001  # ~100m per cell

LAT_MIN, LAT_MAX = 33.720555, 34.396753
LON_MIN, LON_MAX = -118.790071, -117.966592

LEGACY_WEIGHTS = {
    110: 10,
    121: 9, 122: 9,
    210: 8, 220: 8,
    230: 7, 231: 7, 250: 7, 251: 7,
    626: 3,
}

NIBRS_WEIGHTS = {
    "09A": 10, "09B": 10,
    "11A": 9, "11B": 9, "11C": 9, "11D": 9,
    "120": 8,
    "13A": 7,
    "13B": 4,
    "13C": 3,
    "23A": 2,
}


def raw_to_intensity(raw: float) -> float:
    if raw == 0:
        return 1.0
    elif raw <= 5:
        return 0.75
    elif raw <= 15:
        return 0.5
    elif raw <= 30:
        return 0.25
    else:
        return 0.0


def cell_key(lat: float, lon: float) -> str:
    return f"{round(lat / GRID_RES) * GRID_RES:.4f},{round(lon / GRID_RES) * GRID_RES:.4f}"


def cell_center(key: str) -> tuple[float, float]:
    lat, lon = key.split(",")
    return float(lat), float(lon)


def fetch_legacy():
    url = "https://data.lacity.org/resource/2nrs-mtv8.json"
    codes_str = ", ".join(f"'{c}'" for c in LEGACY_WEIGHTS)
    offset = 0
    print("Fetching legacy 2023-2024 dataset...")
    while True:
        resp = requests.get(url, params={
            "$select": "lat,lon,crm_cd",
            "$where": f"crm_cd in({codes_str}) AND date_occ>='2023-01-01T00:00:00'",
            "$limit": PAGE_SIZE, "$offset": offset,
        }, timeout=60)
        resp.raise_for_status()
        batch = resp.json()
        if not batch:
            break
        for inc in batch:
            try:
                lat, lon = float(inc["lat"]), float(inc["lon"])
                if lat == 0.0 and lon == 0.0:
                    continue
                if not (LAT_MIN <= lat <= LAT_MAX and LON_MIN <= lon <= LON_MAX):
                    continue
                yield lat, lon, float(LEGACY_WEIGHTS.get(int(inc["crm_cd"]), 1))
            except (KeyError, ValueError):
                continue
        print(f"  {offset + len(batch)} records...")
        if len(batch) < PAGE_SIZE:
            break
        offset += PAGE_SIZE


def fetch_nibrs():
    url = "https://data.lacity.org/resource/k7nn-b2ep.json"
    codes_str = ", ".join(f"'{c}'" for c in NIBRS_WEIGHTS)
    offset = 0
    print("Fetching NIBRS 2026-present dataset...")
    while True:
        resp = requests.get(url, params={
            "$select": "hndrdth_lat,hndrdth_lon,nibr_code",
            "$where": f"nibr_code in({codes_str})",
            "$limit": PAGE_SIZE, "$offset": offset,
        }, timeout=60)
        resp.raise_for_status()
        batch = resp.json()
        if not batch:
            break
        for inc in batch:
            try:
                lat = float(inc["hndrdth_lat"])
                lon = float(inc["hndrdth_lon"])
                if lat == 0.0 and lon == 0.0:
                    continue
                if not (LAT_MIN <= lat <= LAT_MAX and LON_MIN <= lon <= LON_MAX):
                    continue
                yield lat, lon, float(NIBRS_WEIGHTS.get(inc.get("nibr_code", ""), 1))
            except (KeyError, ValueError):
                continue
        print(f"  {offset + len(batch)} records...")
        if len(batch) < PAGE_SIZE:
            break
        offset += PAGE_SIZE


def main():
    grid: dict[str, float] = {}
    total = 0

    for lat, lon, weight in [*fetch_legacy(), *fetch_nibrs()]:
        key = cell_key(lat, lon)
        grid[key] = grid.get(key, 0.0) + weight
        total += 1

    print(f"\nTotal incidents processed: {total}")

    heatmap_points = [
        [*cell_center(k), raw_to_intensity(v)]
        for k, v in grid.items()
    ]

    buckets = {1.0: 0, 0.75: 0, 0.5: 0, 0.25: 0, 0.0: 0}
    for p in heatmap_points:
        buckets[p[2]] = buckets.get(p[2], 0) + 1
    print("\nBucket distribution:")
    labels = {1.0: "Safe", 0.75: "Low risk", 0.5: "Moderate", 0.25: "Elevated", 0.0: "High risk"}
    for intensity, count in sorted(buckets.items(), reverse=True):
        print(f"  {labels[intensity]:12s} ({intensity}): {count} cells ({count/len(heatmap_points)*100:.1f}%)")

    with open(OUTPUT_FILE, "w") as f:
        json.dump(heatmap_points, f)

    print(f"\nSaved to {OUTPUT_FILE} ({len(heatmap_points)} cells)")


if __name__ == "__main__":
    main()
