/** Sample Cape Town data for the UNICAB TAXI pitch demo. Client-side only. */
import roadGeometry from "./routes.json";

export const CAPE_TOWN_CENTER = [-33.9249, 18.4241];

export const LOCATIONS = [
  { id: "cbd", name: "Cape Town CBD", subtitle: "Long Street", area: "City Bowl", lat: -33.9249, lng: 18.4241 },
  { id: "waterfront", name: "V&A Waterfront", subtitle: "Clock Tower", area: "Waterfront", lat: -33.9036, lng: 18.4205 },
  { id: "airport", name: "Cape Town Airport", subtitle: "CPT arrivals", area: "Airport", lat: -33.9694, lng: 18.5969 },
  { id: "greenpoint", name: "Green Point", subtitle: "Stadium precinct", area: "Atlantic Seaboard", lat: -33.9069, lng: 18.403 },
  { id: "campsbay", name: "Camps Bay", subtitle: "Beachfront", area: "Atlantic Seaboard", lat: -33.951, lng: 18.377 },
  { id: "seapoint", name: "Sea Point", subtitle: "Promenade", area: "Atlantic Seaboard", lat: -33.9186, lng: 18.3884 },
  { id: "kirstenbosch", name: "Kirstenbosch", subtitle: "Gardens gate", area: "Southern Suburbs", lat: -33.9875, lng: 18.4326 },
  { id: "woodstock", name: "Woodstock", subtitle: "Salt River Road", area: "City Bowl", lat: -33.9274, lng: 18.4472 },
];

export const VEHICLES = [
  {
    id: "go",
    name: "UNICAB Go",
    detail: "Toyota Corolla or similar",
    blurb: "Everyday city rides",
    seats: 4,
    multiplier: 1,
    etaAdd: 0,
  },
  {
    id: "comfort",
    name: "UNICAB Comfort",
    detail: "Mercedes E-Class or similar",
    blurb: "Quieter cabin, more room",
    seats: 4,
    multiplier: 1.55,
    etaAdd: 2,
  },
  {
    id: "xl",
    name: "UNICAB XL",
    detail: "VW Caravelle or similar",
    blurb: "Groups and extra luggage",
    seats: 6,
    multiplier: 1.85,
    etaAdd: 4,
  },
];

export const DRIVERS = [
  {
    id: "thabo",
    name: "Thabo M.",
    plate: "CA 482-193",
    vehicle: "Toyota Corolla",
    colour: "White",
    classId: "go",
    rating: 4.92,
    trips: 1840,
    initials: "TM",
    lat: -33.918,
    lng: 18.415,
  },
  {
    id: "zinhle",
    name: "Zinhle N.",
    plate: "CA 907-221",
    vehicle: "Mercedes E-Class",
    colour: "Black",
    classId: "comfort",
    rating: 4.88,
    trips: 960,
    initials: "ZN",
    lat: -33.912,
    lng: 18.428,
  },
  {
    id: "andre",
    name: "Andre P.",
    plate: "CA 330-774",
    vehicle: "VW Caravelle",
    colour: "Silver",
    classId: "xl",
    rating: 4.85,
    trips: 640,
    initials: "AP",
    lat: -33.931,
    lng: 18.41,
  },
  {
    id: "leah",
    name: "Leah S.",
    plate: "CA 615-088",
    vehicle: "Toyota Corolla",
    colour: "Grey",
    classId: "go",
    rating: 4.95,
    trips: 1210,
    initials: "LS",
    lat: -33.909,
    lng: 18.442,
  },
];

export const DISPATCH_TRIPS = [
  {
    id: "T-1048",
    status: "request",
    rider: "Sam K.",
    pickup: "Cape Town CBD",
    dropoff: "V&A Waterfront",
    vehicle: "UNICAB Go",
    estimate: 86,
    when: "Just now",
    driverId: "",
  },
  {
    id: "T-1047",
    status: "request",
    rider: "Lerato D.",
    pickup: "Sea Point",
    dropoff: "Cape Town Airport",
    vehicle: "UNICAB Comfort",
    estimate: 418,
    when: "2 min ago",
    driverId: "",
  },
  {
    id: "T-1042",
    status: "assigned",
    rider: "Noah V.",
    pickup: "Woodstock",
    dropoff: "Green Point",
    vehicle: "UNICAB Go",
    estimate: 94,
    when: "6 min ago",
    driverId: "leah",
  },
  {
    id: "T-1036",
    status: "enroute",
    rider: "Amina R.",
    pickup: "Camps Bay",
    dropoff: "Kirstenbosch",
    vehicle: "UNICAB XL",
    estimate: 246,
    when: "14 min ago",
    driverId: "andre",
  },
  {
    id: "T-1028",
    status: "done",
    rider: "Chris P.",
    pickup: "V&A Waterfront",
    dropoff: "Cape Town CBD",
    vehicle: "UNICAB Go",
    estimate: 72,
    when: "38 min ago",
    driverId: "thabo",
  },
];

/** Partner start pin. Matches the baked approach|cbd road route. */
export const DRIVER_START = { id: "approach", name: "City Bowl", lat: -33.93688, lng: 18.4161 };

/**
 * Partner on the shared pitch trip. Plate is the demo plate SAMPLE.
 * Photo is an initials placeholder, not a portrait.
 */
export const SAMPLE_PARTNER = {
  id: "thabo",
  name: "Thabo M.",
  initials: "TM",
  plate: "SAMPLE",
  vehicle: "Toyota Corolla",
  colour: "White",
  classId: "go",
  rating: 4.92,
  trips: 1840,
};

/** One sample trip, shown the same way to the passenger and the partner. */
export const SAMPLE_TRIP_ID = "T-1048";

/** Canned partner job for the pitch demo. */
export const CANNED_DRIVER_JOB = {
  id: SAMPLE_TRIP_ID,
  riderName: "Sam K.",
  pickup: LOCATIONS[0],
  dropoff: LOCATIONS[1],
  notes: "Main entrance",
  etaToPickupMin: 4,
  partner: SAMPLE_PARTNER,
  vehicleId: "go",
};

/** Earlier trips already on the partner's day, before the live demo request. */
export const TODAY_TRIPS = [
  { id: "T-1012", time: "07:40", from: "Sea Point", to: "Cape Town CBD", earn: 78, km: 4.2 },
  { id: "T-1018", time: "08:15", from: "Woodstock", to: "V&A Waterfront", earn: 64, km: 3.1 },
  { id: "T-1024", time: "09:05", from: "Green Point", to: "Camps Bay", earn: 112, km: 6.4 },
  { id: "T-1031", time: "10:20", from: "Cape Town CBD", to: "Kirstenbosch", earn: 146, km: 9.8 },
];

export function distanceKm(a, b) {
  const earth = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function estimateEtaMinutes(km) {
  return Math.max(4, Math.round(km / 0.42));
}

export function fareBreakdown(km, vehicle) {
  const rawBase = 42;
  const rawDistance = Math.round(km * 13);
  const total = Math.max(55, Math.round((rawBase + rawDistance) * vehicle.multiplier));
  const base = Math.round(rawBase * vehicle.multiplier);
  const distance = Math.max(0, total - base);
  return { base, distance, total, km };
}

export function formatZar(amount) {
  return `R${Math.round(amount).toLocaleString("en-ZA")}`;
}

export function formatKm(km) {
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function getLocationById(id) {
  return LOCATIONS.find((place) => place.id === id);
}

export function driverForClass(classId) {
  return DRIVERS.find((driver) => driver.classId === classId) || DRIVERS[0];
}

export function lerpRoute(from, to, t) {
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}

export function routePoints(from, to, steps = 16) {
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    points.push(lerpRoute(from, to, i / steps));
  }
  return points;
}

/** Pre-baked driving geometry along Cape Town streets. No runtime routing call. */
export function roadRoute(from, to) {
  if (!from || !to) return [];
  if (from.id && to.id && from.id !== to.id) {
    const baked = roadGeometry[`${from.id}|${to.id}`];
    if (baked) return baked.map(([lat, lng]) => ({ lat, lng }));
  }
  return routePoints(from, to, 24);
}

export function pointAlong(route, t) {
  if (!route?.length) return null;
  const clamped = Math.min(1, Math.max(0, t));
  if (route.length === 1) return { lat: route[0].lat, lng: route[0].lng };
  const scaled = clamped * (route.length - 1);
  const index = Math.min(Math.floor(scaled), route.length - 2);
  return lerpRoute(route[index], route[index + 1], scaled - index);
}

export function bearingDeg(from, to) {
  if (!from || !to) return 0;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function routeLengthKm(points) {
  let km = 0;
  for (let i = 1; i < (points?.length || 0); i += 1) km += distanceKm(points[i - 1], points[i]);
  return km;
}

/** Same UNICAB Go fare the passenger and partner show for trip T-1048. */
export const SAMPLE_GO_FARE = fareBreakdown(
  routeLengthKm(roadRoute(LOCATIONS[0], LOCATIONS[1])),
  VEHICLES[0]
);
const sampleTrip = DISPATCH_TRIPS.find((trip) => trip.id === SAMPLE_TRIP_ID);
if (sampleTrip) sampleTrip.estimate = SAMPLE_GO_FARE.total;

/** Sample clock for the control room. T-1047 is then 2 minutes old. */
export const CONTROL_CLOCK = "12:20";

/** Completed city trips beyond one partner's own list. Same places and fleet. */
export const CONTROL_EXTRA_COMPLETED = [
  { id: "T-1004", time: "07:10", from: "Cape Town CBD", to: "Sea Point", earn: 70, driverId: "leah", classId: "go" },
  { id: "T-1008", time: "08:40", from: "V&A Waterfront", to: "Camps Bay", earn: 155, driverId: "zinhle", classId: "comfort" },
  { id: "T-1015", time: "09:30", from: "Cape Town Airport", to: "Cape Town CBD", earn: 210, driverId: "andre", classId: "xl" },
  { id: "T-1021", time: "11:05", from: "Woodstock", to: "Green Point", earn: 90, driverId: "leah", classId: "go" },
];

export const CONTROL_CANCELLATIONS = [
  { id: "T-0994", time: "08:50", rider: "Mia J.", reason: "Rider cancelled" },
  { id: "T-1001", time: "10:05", rider: "Owen L.", reason: "No partner nearby" },
];

/** Offers a partner did not take, besides the two cancellations. */
export const CONTROL_DECLINES = 1;

/** Pickup minutes on accepted sample trips. */
export const CONTROL_PICKUP_MINUTES = [4, 3, 5, 4, 6, 3, 4, 5, 4, 3, 4];
