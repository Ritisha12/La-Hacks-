# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a transit routing project for LA Hacks using **OpenTripPlanner (OTP) 2.8.1** with LA Metro bus/rail GTFS feeds and OpenStreetMap data for the Los Angeles area.

## Key Files

| File | Purpose |
|------|---------|
| `otp-shaded-2.8.1.jar` | OpenTripPlanner server JAR |
| `gtfs_bus.zip` | LA Metro bus GTFS feed (112 routes, 11,851 stops) |
| `data/la_metro_service_area.osm.pbf` | Clipped OSM street network for the LA Metro service area |
| `data/los-angeles_california.osm.pbf` | Full LA OSM extract (source for clipping) |
| `data/extract_la_metro.sh` | Script to re-clip OSM data to the LA Metro bounding box |

## OTP Workflow

### 1. Build the graph (one-time, ~5–10 min, requires ~4 GB RAM)

```bash
java -Xmx4G -jar otp-shaded-2.8.1.jar --build --save data/
```

This reads `data/*.osm.pbf` and `data/*.zip` (GTFS) and writes `graph.obj` to the data directory.

### 2. Run the OTP server

```bash
java -Xmx2G -jar otp-shaded-2.8.1.jar --load data/
```

The OTP REST API is available at `http://localhost:8080`. The interactive debug UI is at `http://localhost:8080/index.html`.

### 3. Re-clip OSM data (if source PBF changes)

```bash
# Requires: brew install osmium-tool
./data/extract_la_metro.sh data/los-angeles_california.osm.pbf data/la_metro_service_area.osm.pbf
```

## Data Sources

- **Bus GTFS**: [gitlab.com/LACMTA/gtfs_bus](https://gitlab.com/LACMTA/gtfs_bus)
- **Rail GTFS**: [gitlab.com/LACMTA/gtfs_rail](https://gitlab.com/LACMTA/gtfs_rail)
- **OSM**: Geofabrik California extract → clipped with osmium to LA Metro bounding box (`-118.790071,33.720555,-117.966592,34.396753`)

## OTP API Quick Reference

Trip plan endpoint:
```
GET http://localhost:8080/otp/routers/default/plan
  ?fromPlace=34.0522,-118.2437
  &toPlace=34.0194,-118.4912
  &time=1:00pm&date=04-24-2026
  &mode=TRANSIT,WALK
```
