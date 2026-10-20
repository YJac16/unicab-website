/** Shared sample trip for /ride, /dispatch, /drive, and /control. */
import { useEffect, useState } from "react";
import {
  DRIVERS,
  LOCATIONS,
  VEHICLES,
  distanceKm,
  getLocationById,
} from "./mockData";

export const DEMO_KEY = "unicab-demo-session";
const CHANNEL_NAME = "unicab-demo";

export const IDLE_SESSION = {
  phase: "idle",
  pickupId: "cbd",
  dropoffId: "waterfront",
  vehicleId: "go",
  driverId: "",
  rating: 0,
  tip: null,
  demoRunning: false,
  demoLabel: "Sample story",
  notice: "",
};

const ACTIVE = ["assigned", "accepted", "arrived", "started"];

let channel;

function getChannel() {
  if (typeof BroadcastChannel === "undefined") return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

export function readSession() {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (!raw) return { ...IDLE_SESSION };
    return { ...IDLE_SESSION, ...JSON.parse(raw) };
  } catch {
    return { ...IDLE_SESSION };
  }
}

export function writeSession(next) {
  const value = { ...IDLE_SESSION, ...next };
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(value));
  } catch {
    /* private mode */
  }
  getChannel()?.postMessage(value);
  window.dispatchEvent(new CustomEvent("unicab-demo", { detail: value }));
  return value;
}

export function patchSession(partial) {
  return writeSession({ ...readSession(), ...partial });
}

export function useDemoSession() {
  const [session, setSession] = useState(readSession);

  useEffect(() => {
    const apply = (value) => setSession({ ...IDLE_SESSION, ...(value || readSession()) });
    const onStorage = (event) => {
      if (event.key === DEMO_KEY) apply(readSession());
    };
    const onLocal = (event) => apply(event.detail);
    const bc = getChannel();
    const onMessage = (event) => apply(event.data);
    window.addEventListener("storage", onStorage);
    window.addEventListener("unicab-demo", onLocal);
    bc?.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("unicab-demo", onLocal);
      bc?.removeEventListener("message", onMessage);
    };
  }, []);

  return session;
}

export function pickupMinutes(km) {
  return Math.max(2, Math.round(km / 0.5));
}

const STATIC_KEY = "unicab-static-assigns";

export function readStaticAssigns() {
  try {
    return JSON.parse(localStorage.getItem(STATIC_KEY) || "{}");
  } catch {
    return {};
  }
}

export function assignStaticTrip(tripId, driverId) {
  const next = { ...readStaticAssigns(), [tripId]: driverId };
  try {
    localStorage.setItem(STATIC_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent("unicab-static-assigns", { detail: next }));
  return next;
}

export function useStaticAssigns() {
  const [assigns, setAssigns] = useState(readStaticAssigns);
  useEffect(() => {
    const apply = () => setAssigns(readStaticAssigns());
    window.addEventListener("unicab-static-assigns", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("unicab-static-assigns", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);
  return assigns;
}

export function busyDriverIds(session, staticAssigns = {}) {
  const busy = new Set(["andre", "leah"]);
  Object.values(staticAssigns).forEach((id) => {
    if (id) busy.add(id);
  });
  if (session?.driverId && ACTIVE.includes(session.phase)) busy.add(session.driverId);
  return busy;
}

export function rankPartners(pickup, { classId = "", busyIds = new Set() } = {}) {
  if (!pickup) return [];
  return DRIVERS.map((driver) => {
    const km = distanceKm(driver, pickup);
    return {
      driver,
      km,
      eta: pickupMinutes(km),
      busy: busyIds.has(driver.id),
      classMatch: !classId || driver.classId === classId,
    };
  }).sort((a, b) => {
    if (a.busy !== b.busy) return a.busy ? 1 : -1;
    if (a.classMatch !== b.classMatch) return a.classMatch ? -1 : 1;
    return a.eta - b.eta || a.km - b.km;
  });
}

export function nearestFreePartner(session) {
  const pickup = getLocationById(session.pickupId) || LOCATIONS[0];
  const vehicle = VEHICLES.find((item) => item.id === session.vehicleId) || VEHICLES[0];
  const ranked = rankPartners(pickup, {
    classId: vehicle.id,
    busyIds: busyDriverIds({ ...session, phase: "requested", driverId: "" }),
  });
  return (ranked.find((row) => !row.busy) || ranked[0])?.driver || DRIVERS[0];
}

export function confirmSampleRide(partial = {}) {
  return patchSession({
    ...partial,
    phase: "requested",
    driverId: "",
    rating: 0,
    tip: null,
    notice: "Sample request is on the dispatch board.",
  });
}

export function assignDriver(driverId) {
  const driver = DRIVERS.find((item) => item.id === driverId) || nearestFreePartner(readSession());
  return patchSession({
    phase: "assigned",
    driverId: driver.id,
    notice: `${driver.name} is assigned. The request is on their screen.`,
  });
}

export function assignNearest() {
  return assignDriver(nearestFreePartner(readSession()).id);
}

export function acceptSampleJob() {
  return patchSession({ phase: "accepted", notice: "Partner accepted the sample trip." });
}

export function declineSampleJob() {
  return patchSession({
    phase: "requested",
    driverId: "",
    notice: "Partner declined. The sample request is unassigned again.",
  });
}

export function markArrived() {
  return patchSession({ phase: "arrived", notice: "Partner has arrived at pickup." });
}

export function startSampleTrip() {
  return patchSession({ phase: "started", notice: "Sample trip is in progress." });
}

export function completeSampleTrip() {
  return patchSession({ phase: "complete", notice: "Sample trip is complete." });
}

export function resetSample() {
  try {
    localStorage.removeItem(STATIC_KEY);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent("unicab-static-assigns", { detail: {} }));
  return writeSession({ ...IDLE_SESSION });
}

export const DEMO_STEP_LABELS = [
  "Passenger confirms",
  "Dispatch assigns",
  "Partner accepts",
  "Partner arrives",
  "Trip starts",
  "Trip completes",
];

export function completedDemoSteps(session) {
  switch (session?.phase) {
    case "requested": return 1;
    case "assigned": return 2;
    case "accepted": return 3;
    case "arrived": return 4;
    case "started": return 5;
    case "complete":
    case "rated": return 6;
    default: return 0;
  }
}

let demoTimer = null;

export function stopDemo() {
  if (demoTimer) clearTimeout(demoTimer);
  demoTimer = null;
  const current = readSession();
  if (current.demoRunning) {
    patchSession({ demoRunning: false, demoLabel: "Sample story paused" });
  }
}

const DEMO_STEPS = [
  {
    label: DEMO_STEP_LABELS[0],
    run: () => confirmSampleRide({ pickupId: "cbd", dropoffId: "waterfront", vehicleId: "go" }),
  },
  { label: DEMO_STEP_LABELS[1], run: () => assignNearest() },
  { label: DEMO_STEP_LABELS[2], run: () => acceptSampleJob() },
  { label: DEMO_STEP_LABELS[3], run: () => markArrived() },
  { label: DEMO_STEP_LABELS[4], run: () => startSampleTrip() },
  { label: DEMO_STEP_LABELS[5], run: () => completeSampleTrip() },
];

export function nextDemoStep() {
  const done = completedDemoSteps(readSession());
  const step = DEMO_STEPS[done];
  if (!step) return readSession();
  step.run();
  return patchSession({
    demoRunning: false,
    demoLabel: `Step ${done + 1} of 6 · ${step.label}`,
  });
}

export function startDemo() {
  if (demoTimer) clearTimeout(demoTimer);
  let index = completedDemoSteps(readSession());
  const tick = () => {
    const step = DEMO_STEPS[index];
    if (!step) {
      demoTimer = null;
      patchSession({ demoRunning: false, demoLabel: "Step 6 of 6 · Trip completes" });
      return;
    }
    step.run();
    patchSession({ demoRunning: true, demoLabel: `Step ${index + 1} of 6 · ${step.label}` });
    index += 1;
    demoTimer = setTimeout(tick, 1700);
  };
  tick();
}
