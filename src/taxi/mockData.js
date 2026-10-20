/** Sample Cape Town data for the UNICAB TAXI pitch demo. Client-side only. */

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
    photo: "/Thabo.png",
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
    photo: "/Zinhle.jpg",
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
    photo: "/Andre.jpg",
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
    photo: "/Leah.png",
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

/** Canned driver job. Fares stay off the driver screen. */
export const CANNED_DRIVER_JOB = {
  id: "job-demo-001",
  riderName: "Sam K.",
  pickup: LOCATIONS[0],
  dropoff: LOCATIONS[1],
  notes: "Sample rider · main entrance",
  etaToPickupMin: 4,
};

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
