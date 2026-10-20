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
  demoLabel: "Sample story is ready",
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

export function busyDriverIds(session) {
  const busy = new Set(["andre", "leah"]);
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
  return writeSession({ ...IDLE_SESSION });
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
    label: "Passenger confirms T-1048",
    run: () => confirmSampleRide({ pickupId: "cbd", dropoffId: "waterfront", vehicleId: "go" }),
  },
  { label: "Request is on dispatch", run: () => patchSession({}) },
  { label: "Assign nearest partner", run: () => assignNearest() },
  { label: "Partner accepts", run: () => acceptSampleJob() },
  { label: "Partner arrives", run: () => markArrived() },
  { label: "Trip starts", run: () => startSampleTrip() },
  { label: "Trip completes", run: () => completeSampleTrip() },
];

export function startDemo() {
  if (demoTimer) clearTimeout(demoTimer);
  let index = 0;
  const tick = () => {
    const step = DEMO_STEPS[index];
    if (!step) {
      demoTimer = null;
      patchSession({ demoRunning: false, demoLabel: "Sample story complete" });
      return;
    }
    step.run();
    patchSession({ demoRunning: true, demoLabel: step.label });
    index += 1;
    demoTimer = setTimeout(tick, 1700);
  };
  tick();
}
