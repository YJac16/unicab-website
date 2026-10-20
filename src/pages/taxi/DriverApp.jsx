import React, { useEffect, useMemo, useRef, useState } from "react";
import TaxiChrome from "../../components/taxi/TaxiChrome";
import BottomSheet from "../../components/taxi/BottomSheet";
import TaxiMap from "../../components/taxi/TaxiMap";
import useTaxiTheme from "../../taxi/useTaxiTheme";
import { CANNED_DRIVER_JOB, formatKm, distanceKm, estimateEtaMinutes, routePoints, lerpRoute } from "../../taxi/mockData";

const HOME = {
  lat: CANNED_DRIVER_JOB.pickup.lat - 0.012,
  lng: CANNED_DRIVER_JOB.pickup.lng - 0.008,
};

export default function DriverApp() {
  const { theme, toggleTheme } = useTaxiTheme();
  const job = CANNED_DRIVER_JOB;
  const home = HOME;
  const [online, setOnline] = useState(false);
  const [stage, setStage] = useState("idle");
  const [driverPos, setDriverPos] = useState(home);
  const posRef = useRef(home);
  const [routeFrom, setRouteFrom] = useState(home);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    posRef.current = driverPos;
  }, [driverPos]);

  const routeToPickup = useMemo(() => routePoints(routeFrom, job.pickup, 12), [routeFrom, job.pickup]);
  const routeTrip = useMemo(() => routePoints(job.pickup, job.dropoff, 14), [job.pickup, job.dropoff]);
  const tripKm = distanceKm(job.pickup, job.dropoff);
  const tripMin = estimateEtaMinutes(tripKm);

  useEffect(() => {
    if (!online || stage !== "idle") return undefined;
    const timer = setTimeout(() => setStage("incoming"), 1400);
    return () => clearTimeout(timer);
  }, [online, stage]);

  useEffect(() => {
    if (stage !== "to-pickup") return undefined;
    const start = { ...posRef.current };
    let step = 0;
    const anim = setInterval(() => {
      step += 1;
      const t = Math.min(step / 10, 1);
      setDriverPos(lerpRoute(start, job.pickup, t));
      setProgress(t);
      if (t >= 1) {
        clearInterval(anim);
        setStage("at-pickup");
      }
    }, 420);
    return () => clearInterval(anim);
  }, [stage, job.pickup]);

  useEffect(() => {
    if (stage !== "in-trip") return undefined;
    let step = 0;
    const anim = setInterval(() => {
      step += 1;
      const t = Math.min(step / 14, 1);
      setDriverPos(lerpRoute(job.pickup, job.dropoff, t));
      setProgress(t);
      if (t >= 1) {
        clearInterval(anim);
        setStage("complete");
      }
    }, 460);
    return () => clearInterval(anim);
  }, [stage, job.pickup, job.dropoff]);

  function goOffline() {
    setOnline(false);
    setStage("idle");
    setProgress(0);
    setDriverPos(home);
  }

  function goOnline() {
    setOnline(true);
    setStage("idle");
    setProgress(0);
  }

  const mapRoute =
    stage === "to-pickup" || stage === "at-pickup"
      ? routeToPickup
      : stage === "in-trip" || stage === "complete"
        ? routeTrip
        : stage === "incoming"
          ? routePoints(job.pickup, job.dropoff, 10)
          : [];

  const status = !online
    ? "You are offline"
    : stage === "idle"
      ? "Waiting for a sample request"
      : stage === "incoming"
        ? "New sample request"
        : stage === "to-pickup"
          ? "Navigate to pickup"
          : stage === "at-pickup"
            ? "At the pickup pin"
            : stage === "in-trip"
              ? "Trip in progress"
              : "Trip complete";

  return (
    <TaxiChrome
      theme={theme}
      onToggleTheme={toggleTheme}
      action={
        <button
          type="button"
          className={`taxi-online ${online ? "is-on" : ""}`}
          aria-pressed={online}
          onClick={() => (online ? goOffline() : goOnline())}
        >
          {online ? "Online" : "Offline"}
        </button>
      }
    >
      <h1 className="taxi-sr">UNICAB partner</h1>
      <p className="taxi-sr" aria-live="polite">
        {status}
      </p>
      <TaxiMap
        theme={theme}
        pickup={online ? job.pickup : null}
        dropoff={online && stage !== "idle" ? job.dropoff : null}
        driverPos={online ? driverPos : null}
        route={online ? mapRoute : []}
        fitRoute={online && mapRoute.length > 1}
      />

      <BottomSheet labelledBy="drive-sheet-title">
        {!online && (
          <>
            <h2 id="drive-sheet-title" className="taxi-sheet-title">
              You&apos;re offline
            </h2>
            <p className="taxi-sheet-sub">
              Go online to receive one sample request in the City Bowl. This desk is not connected to live jobs.
            </p>
            <div className="taxi-empty-mark" aria-hidden="true" />
            <button type="button" className="taxi-cta" onClick={goOnline}>
              Go online
            </button>
          </>
        )}

        {online && stage === "idle" && (
          <>
            <h2 id="drive-sheet-title" className="taxi-sheet-title">
              Looking nearby
            </h2>
            <p className="taxi-sheet-sub">A sample request will arrive in a moment.</p>
            <div className="taxi-skeleton" aria-hidden="true">
              <span />
              <span />
            </div>
          </>
        )}

        {online && stage === "incoming" && (
          <>
            <h2 id="drive-sheet-title" className="taxi-sheet-title">
              New sample request
            </h2>
            <p className="taxi-person-name">{job.riderName}</p>
            <p className="taxi-sheet-sub">{job.notes}</p>
            <ol className="taxi-stops">
              <li>
                <span className="taxi-stop-label">Pickup</span>
                <span>{job.pickup.name}</span>
              </li>
              <li>
                <span className="taxi-stop-label">Drop-off</span>
                <span>{job.dropoff.name}</span>
              </li>
            </ol>
            <p className="taxi-sheet-sub">
              About {job.etaToPickupMin} min to the pin · trip {formatKm(tripKm)}, about {tripMin} min
            </p>
            <button
              type="button"
              className="taxi-cta"
              onClick={() => {
                setRouteFrom({ ...posRef.current });
                setProgress(0);
                setStage("to-pickup");
              }}
            >
              Accept trip
            </button>
            <button type="button" className="taxi-cta-secondary" onClick={() => setStage("idle")}>
              Decline
            </button>
          </>
        )}

        {online && stage === "to-pickup" && (
          <>
            <h2 id="drive-sheet-title" className="taxi-sheet-title">
              Navigate to pickup
            </h2>
            <p className="taxi-sheet-sub">{job.pickup.name} · {job.pickup.subtitle}</p>
            <div className="taxi-progress" aria-hidden="true">
              <span style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </>
        )}

        {online && stage === "at-pickup" && (
          <>
            <h2 id="drive-sheet-title" className="taxi-sheet-title">
              At pickup
            </h2>
            <p className="taxi-sheet-sub">{job.riderName} is the sample passenger at this pin.</p>
            <button type="button" className="taxi-cta" onClick={() => { setProgress(0); setStage("in-trip"); }}>
              Start trip
            </button>
          </>
        )}

        {online && stage === "in-trip" && (
          <>
            <h2 id="drive-sheet-title" className="taxi-sheet-title">
              Trip in progress
            </h2>
            <p className="taxi-sheet-sub">
              Drop-off {job.dropoff.name} · about {Math.max(1, Math.round(tripMin * (1 - progress)))} min
            </p>
            <div className="taxi-progress" aria-hidden="true">
              <span style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </>
        )}

        {online && stage === "complete" && (
          <>
            <h2 id="drive-sheet-title" className="taxi-sheet-title">
              Trip complete
            </h2>
            <p className="taxi-sheet-sub">
              Sample trip closed. Earnings are hidden on the partner screen in this demo.
            </p>
            <button
              type="button"
              className="taxi-cta"
              onClick={() => {
                setStage("idle");
                setProgress(0);
                const next = { lat: job.dropoff.lat - 0.006, lng: job.dropoff.lng - 0.004 };
                setDriverPos(next);
              }}
            >
              Wait for the next request
            </button>
            <button type="button" className="taxi-cta-secondary" onClick={goOffline}>
              Go offline
            </button>
          </>
        )}
      </BottomSheet>
    </TaxiChrome>
  );
}
