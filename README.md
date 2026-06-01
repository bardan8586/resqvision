# ResQVision — NSW Coastal Rescue Coordination Prototype

A map-first operator console for AI-assisted swimmer risk detection and coastal rescue coordination. Inspired by emergency dispatch and tactical monitoring systems (Flock, Aerodome, coast guard tooling).

This is a frontend prototype with hardcoded operational data, built to communicate the product vision and operator workflow.

## Features

- **3-column operator console** (desktop): incident queue · interactive map · incident detail + camera feed
- **Mobile responder layout** with bottom tab nav (auto for phones + "Mobile preview" toggle on desktop)
- **Interactive Mapbox GL map** of the NSW coast with pan/zoom
  - Camera markers at real GPS coordinates
  - Coverage wedges showing each camera's field of view + range
  - Pulsing swimmer alert marker
  - Shore-distance line + label
  - Animated rescue route (camera → swimmer)
- **Simulated CV camera feed** with bounding boxes, tracking IDs, heatmap, swim zone, rip arrows, YOLOv8 model badge, frame counter
- **Operator actions**: request visual confirm, start rescue route, escalate, request additional units (jetski / helicopter / lifeguard tower)

## Tech

- React 19 + Vite
- Tailwind v4
- Mapbox GL JS v2 (WebGL1, broader compatibility)
- Framer Motion
- Lucide React icons

## Run locally

```bash
npm install
cp .env.example .env   # then add your Mapbox token
npm run dev            # http://localhost:5173
```

## Environment

`.env` must contain:

```
VITE_MAPBOX_TOKEN=pk.YourMapboxAccessToken
```

## Status

Frontend-only prototype with hardcoded data. Built to demonstrate operational workflow and product direction for ResQVision (Alex Piatek). Not production-ready.
