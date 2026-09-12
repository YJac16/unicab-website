import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DemoBanner from "../../components/taxi/DemoBanner";
import BottomSheet from "../../components/taxi/BottomSheet";
import TaxiMap from "../../components/taxi/TaxiMap";
import { CANNED_DRIVER_JOB, routePoints, lerpRoute } from "../../taxi/mockData";

export default function DriverApp() {
  const [online, setOnline] = useState(false);
  const [stage, setStage] = useState("idle");
  const [driverPos, setDriverPos] = useState({
    lat: CANNED_DRIVER_JOB.pickup.lat - 0.012,
    lng: CANNED_DRIVER_JOB.pickup.lng - 0.008,
  });

  const job = CANNED_DRIVER_JOB;
  const routeToPickup = useMemo(
    () => routePoints(driverPos, job.pickup, 10),
    [driverPos, job.pickup]
  );
  const routeTrip = useMemo(
    () => routePoints(job.pickup, job.dropoff, 12),
    [job.pickup, job.dropoff]
  );

  useEffect(() => {
    if (!online || stage !== "idle") return;
    const t = setTimeout(() => setStage("incoming"), 2200);
    return () => clearTimeout(t);
  }, [online, stage]);

  useEffect(() => {
    if (stage !== "to-pickup") return;
    let step = 0;
    const start = { ...driverPos };
    const anim = setInterval(() => {
      step += 1;
      const t = Math.min(step / 10, 1);
      setDriverPos(lerpRoute(start, job.pickup, t));
      if (t >= 1) {
        clearInterval(anim);
        setStage("at-pickup");
      }
    }, 450);
    return () => clearInterval(anim);
  }, [stage]);

  useEffect(() => {
    if (stage !== "in-trip") return;
    let step = 0;
    const anim = setInterval(() => {
      step += 1;
      const t = Math.min(step / 14, 1);
      setDriverPos(lerpRoute(job.pickup, job.dropoff, t));
      if (t >= 1) {
        clearInterval(anim);
        setStage("complete");
      }
    }, 500);
    return () => clearInterval(anim);
  }, [stage, job.pickup, job.dropoff]);

  function toggleOnline() {
    if (online) {
      setOnline(false);
      setStage("idle");
      setDriverPos({
        lat: job.pickup.lat - 0.012,
        lng: job.pickup.lng - 0.008,
      });
    } else {
      setOnline(true);
      setStage("idle");
    }
  }

  function acceptJob() {
    setStage("to-pickup");
  }

  function startTrip() {
    setStage("in-trip");
  }

  function endShift() {
    setOnline(false);
    setStage("idle");
  }

  const mapRoute =
    stage === "to-pickup" || stage === "at-pickup"
      ? routeToPickup
      : stage === "in-trip"
        ? routeTrip
        : stage === "incoming" || stage === "complete"
          ? routePoints(job.pickup, job.dropoff)
          : [];

  return (
    <div className="taxi-app">
      <DemoBanner />
      <header className="taxi-header">
        <Link to="/" className="taxi-header-back" aria-label="Back to home">
          ←
        </Link>
        <span className="taxi-header-title">UNICAB Drive</span>
        <button
          type="button"
          className={`taxi-online-pill ${online ? "on" : ""}`}
          onClick={toggleOnline}
        >
          {online ? "Online" : "Offline"}
        </button>
      </header>

      <TaxiMap
        pickup={online ? job.pickup : null}
        dropoff={online && stage !== "idle" ? job.dropoff : null}
        driverPos={online ? driverPos : null}
        route={online ? mapRoute : []}
        fitRoute={stage === "incoming"}
      />

      <BottomSheet>
        {!online && (
          <>
            <h2 className="taxi-sheet-title">You&apos;re offline</h2>
            <p className="taxi-sheet-sub">Go online to receive trip requests in the demo.</p>
            <button type="button" className="taxi-cta" onClick={toggleOnline}>
              Go online
            </button>
          </>
        )}

        {online && stage === "idle" && (
          <>
            <h2 className="taxi-sheet-title">Waiting for requests…</h2>
            <p className="taxi-sheet-sub">Stay in a high-demand zone. A job will arrive shortly.</p>
            <div className="taxi-pulse" aria-hidden="true" />
          </>
        )}

        {online && stage === "incoming" && (
          <>
            <h2 className="taxi-sheet-title">New trip request</h2>
            <div className="taxi-trip-summary">
              <div className="taxi-trip-row">
                <span className="taxi-trip-dot pickup" />
                <div>
                  <div className="taxi-trip-label">Pickup</div>
                  <div>{job.pickup.name}</div>
                </div>
              </div>
              <div className="taxi-trip-row">
                <span className="taxi-trip-dot dropoff" />
                <div>
                  <div className="taxi-trip-label">Drop-off</div>
                  <div>{job.dropoff.name}</div>
                </div>
              </div>
            </div>
            <p className="taxi-sheet-sub">Rider: {job.riderName} · {job.notes}</p>
            <p className="taxi-sheet-sub">~{job.etaToPickupMin} min to pickup</p>
            <button type="button" className="taxi-cta" onClick={acceptJob}>
              Accept trip
            </button>
          </>
        )}

        {online && stage === "to-pickup" && (
          <>
            <h2 className="taxi-sheet-title">Navigate to pickup</h2>
            <p className="taxi-sheet-sub">{job.pickup.name}</p>
            <div className="taxi-pulse slow" aria-hidden="true" />
          </>
        )}

        {online && stage === "at-pickup" && (
          <>
            <h2 className="taxi-sheet-title">At pickup</h2>
            <p className="taxi-sheet-sub">Passenger {job.riderName} is boarding</p>
            <button type="button" className="taxi-cta" onClick={startTrip}>
              Start trip
            </button>
          </>
        )}

        {online && stage === "in-trip" && (
          <>
            <h2 className="taxi-sheet-title">Trip in progress</h2>
            <p className="taxi-sheet-sub">Drop-off: {job.dropoff.name}</p>
            <div className="taxi-pulse slow" aria-hidden="true" />
          </>
        )}

        {online && stage === "complete" && (
          <>
            <h2 className="taxi-sheet-title">Trip complete</h2>
            <p className="taxi-sheet-sub">Great job — ready for the next request.</p>
            <button
              type="button"
              className="taxi-cta"
              onClick={() => {
                setStage("idle");
                setDriverPos({
                  lat: job.dropoff.lat - 0.008,
                  lng: job.dropoff.lng - 0.006,
                });
              }}
            >
              Wait for next job
            </button>
            <button type="button" className="taxi-cta-secondary" onClick={endShift}>
              Go offline
            </button>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
