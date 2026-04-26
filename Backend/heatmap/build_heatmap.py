"""
Builds crime heatmap data from LAPD crime datasets.
Run with: python3 build_heatmap.py
Output: crime_heatmap.json — array of [lat, lon, intensity] points

Data sources:
  - Legacy 2023-2024 (2nrs-mtv8): lat/lon, crm_cd
  - NIBRS 2026-present (k7nn-b2ep): hndrdth_lat/lon, nibr_code
"""

import json
import requests

OUTPUT_FILE = "crime_heatmap.json"
PAGE_SIZE = 50000
GRID_RES = 0.001  # ~100m per cell

# LA Metro service area bounding box (matches OTP OSM clip)
LAT_MIN, LAT_MAX = 33.720555, 34.396753
LON_MIN, LON_MAX = -118.790071, -117.966592

# Legacy dataset: severity weights by crm_cd
LEGACY_WEIGHTS = {
    110: 10,                          # Homicide
    121: 9, 122: 9,                   # Rape
    210: 8, 220: 8,                   # Robbery
    230: 7, 231: 7, 235: 7,
    236: 7, 250: 7, 251: 7,           # Assault
    626: 3,                           # Threats
}

# NIBRS dataset: severity weights by nibr_code
NIBRS_WEIGHTS = {
    "09A": 10, "09B": 10,
    "11A": 9,  "11B": 9, "11C": 9, "11D": 9,
    "120":  8,
    "13A":  7,
    "13B":  4,
    "13C":  3,
    "23A":  2,
}


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
            "$limit": PAGE_SIZE,
            "$offset": offset,
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
            "$limit": PAGE_SIZE,
            "$offset": offset,
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

    max_weight = max(grid.values()) if grid else 1.0
    heatmap_points = [
        [*cell_center(k), round(v / max_weight, 4)]
        for k, v in grid.items()
    ]

    with open(OUTPUT_FILE, "w") as f:
        json.dump(heatmap_points, f)

    print(f"  {len(heatmap_points)} grid cells saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
