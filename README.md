# UNICAB TAXI — Pitch Demo

This Railway deployment (`YJac16/unicab-website`) is a **front-end pitch demo** for UNICAB TAXI — an Uber/Bolt-style ride-hail UX with **simulated trips only**.

> **Not production.** No live GPS, no Supabase Realtime tracking, no real payments.

## Demo routes

| Route | Role |
|-------|------|
| `/` | Landing — choose Rider or Driver |
| `/ride` | Passenger flow: map → confirm → waiting → in-trip → rate |
| `/drive` | Driver flow: online/offline → accept job → pickup → start → complete |

Every screen shows a **“Demo — simulated trips”** banner.

## Tech

- **Vite + React** SPA, served by existing Express `server.js` on Railway
- **Leaflet + OpenStreetMap** tiles (no Mapbox, no API keys)
- **Client-side mock data** in `src/taxi/mockData.js` (Cape Town CBD, Waterfront, Airport, etc.)

## Finance / infra constraints (Sep 2026)

- No second Supabase project; existing Supabase wiring is **not** used for live tracking
- No new Railway service or Vercel Pro
- Drivers never see fares in the driver UI; riders may see a fake all-in estimate
- **UNICAB Travel & Tours** remains on Vercel (`unicab-travel-and-tours`) — not cross-sold here

## Legacy ops routes

Tour booking, admin, and member routes under `/tours`, `/admin`, etc. remain for ops but are **not** linked from the taxi demo home page.

## Local dev

```bash
npm install
npm run dev      # Vite on :5173, proxies /api to :3000
npm run build    # production bundle → dist/
npm start        # node server.js (Railway start command)
```

## Real taxi product

Cash-first MVP and live dispatch are **out of scope** for this demo. This repo exists to pitch investors and partners on UX and brand.
