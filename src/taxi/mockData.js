/** Cape Town–area canned data for the Unicab TAXI pitch demo (client-side only). */

export const CAPE_TOWN_CENTER = [-33.9249, 18.4241];

export const LOCATIONS = [
  { id: "cbd", name: "Cape Town CBD", subtitle: "Long Street area", lat: -33.9249, lng: 18.4241 },
  { id: "waterfront", name: "V&A Waterfront", subtitle: "Clock Tower", lat: -33.9036, lng: 18.4205 },
  { id: "airport", name: "Cape Town Airport", subtitle: "CPT arrivals", lat: -33.9694, lng: 18.5969 },
  { id: "greenpoint", name: "Green Point", subtitle: "Stadium precinct", lat: -33.9069, lng: 18.403 },
  { id: "campsbay", name: "Camps Bay", subtitle: "Beachfront", lat: -33.95, lng: 18.3775 },
];

export const DRIVERS = [
  {
    id: "thabo",
    name: "Thabo M.",
    plate: "CA 123-456",
    vehicle: "Toyota Corolla — white",
    uniform: "White shirt, UNICAB badge",
    rating: 4.9,
    photo: "/Thabo.png",
    lat: -33.918,
    lng: 18.415,
  },
  {
    id: "zinhle",
    name: "Zinhle N.",
    plate: "CA 789-012",
    vehicle: "VW Polo — silver",
    uniform: "White shirt, UNICAB badge",
    rating: 4.8,
    photo: "/Zinhle.jpg",
    lat: -33.912,
    lng: 18.428,
  },
];

/** Haversine distance in km (rough ETA basis). */
export function distanceKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function estimateEtaMinutes(km) {
  return Math.max(3, Math.round(km / 0.45));
}

export function fakePriceZAR(km) {
  const base = 35;
  const perKm = 12;
  return Math.round(base + km * perKm);
}

export function getLocationById(id) {
  return LOCATIONS.find((l) => l.id === id);
}

/** Canned driver job (no fare exposed to driver UI). */
export const CANNED_DRIVER_JOB = {
  id: "job-demo-001",
  riderName: "Alex",
  pickup: LOCATIONS[0],
  dropoff: LOCATIONS[1],
  notes: "Near main entrance",
  etaToPickupMin: 4,
};

/** Interpolate positions along a route for animation. */
export function lerpRoute(from, to, t) {
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}

/** Simple polyline points between two locations. */
export function routePoints(from, to, steps = 12) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(lerpRoute(from, to, i / steps));
  }
  return pts;
}
