# UNICAB TAXI — Pitch Demo

Front-end pitch demo for **UNICAB TAXI** (`YJac16/unicab-website`) — an Uber/Bolt-style ride-hail UX with **simulated trips only**.

> **Not production.** No live GPS, no Supabase Realtime tracking, no real payments.

## Deploy target

| Host | Status |
|------|--------|
| **Vercel Hobby** | ✅ Intended deploy for this pitch demo (static Vite build) |
| **Railway** | ⏸ Deferred until founder + cash (no new Railway service for demo) |

**UNICAB Travel & Tours** brochure lives in the separate repo [`unicab-travel-and-tours`](https://github.com/YJac16/unicab-travel-and-tours) on Vercel — not this repo.

### Deploy to Vercel (Hobby)

1. Import `YJac16/unicab-website` in the [Vercel dashboard](https://vercel.com/new).
2. Framework preset: **Vite** (or use the repo `vercel.json`).
3. Build: `npm run build` → output `dist/`.
4. No env vars required for the taxi demo (Leaflet + OSM, client-side mocks).

SPA routes (`/ride`, `/drive`, legacy `/tours/*`, etc.) are handled by the catch-all rewrite in `vercel.json`.

## Demo routes

| Route | Role |
|-------|------|
| `/` | Landing — ride, drive, or dispatch. Light and dark themes |
| `/ride` | Passenger flow for sample trip T-1048: request, partner on the way, arrived, live trip, arrival, rating and tip, receipt |
| `/drive` | Same trip for the partner: online, request with fare and countdown, navigate, arrive, trip, sample earnings, today |
| `/dispatch` | Sample operations board. Assignments stay in the browser |

Every screen shows a small **Demo** badge. Trips, riders, and fares are sample data.

## Tech

- **Vite + React** static SPA (`npm run build` → `dist/`)
- **Leaflet + OpenStreetMap** standard tiles (no API key). Light and dark are CSS filters on the tiles, with OSM attribution
- **Client-side mock data** in `src/taxi/mockData.js` (Cape Town CBD, Waterfront, Airport, etc.)
- Light and dark themes, stored only in the browser
- Legacy `/api/*` serverless handlers remain for old travel ops but are **not** used by the taxi demo

## Finance / infra constraints (Sep 2026)

- No Mapbox, no paid map tiles, no Realtime GPS firehose
- No second Supabase project; existing Supabase wiring is **not** used for live tracking
- No new Railway service; Vercel Hobby only for this pitch
- Fares and partner earnings in the demo are sample figures only
- No cross-sell of Travel tours/membership in the taxi demo UI

## Legacy ops routes

Tour booking, admin, and member routes under `/tours`, `/admin`, etc. remain in the bundle for ops but are **not** linked from the taxi demo home page.

## Local dev

```bash
npm install
npm run dev      # Vite on :5173 (proxies /api to :3000 if using server.js locally)
npm run build    # production static bundle → dist/
npm run preview  # preview static build
npm start        # optional: node server.js for full-stack local ops
```

## Real taxi product

Cash-first MVP and live dispatch are **out of scope** for this demo. This repo exists to pitch investors and partners on UX and brand. Railway production hosting waits on founder decision and cash.
