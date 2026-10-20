import React, { useEffect, useMemo, useRef, useState } from "react";
import TaxiChrome from "../../components/taxi/TaxiChrome";
import BottomSheet from "../../components/taxi/BottomSheet";
import TaxiMap from "../../components/taxi/TaxiMap";
import useTaxiTheme from "../../taxi/useTaxiTheme";
import {
  CANNED_DRIVER_JOB,
  DRIVER_START,
  TODAY_TRIPS,
  VEHICLES,
  bearingDeg,
  estimateEtaMinutes,
  fareBreakdown,
  formatKm,
  formatZar,
  pointAlong,
  roadRoute,
  routeLengthKm,
} from "../../taxi/mockData";

const ACCEPT_SECONDS = 15;

export default function DriverApp() {
  const { theme, toggleTheme } = useTaxiTheme();
  const job = CANNED_DRIVER_JOB;
  const pickupRoute = useMemo(() => roadRoute(DRIVER_START, job.pickup), [job.pickup]);
  const tripRoute = useMemo(() => roadRoute(job.pickup, job.dropoff), [job.pickup, job.dropoff]);
  const pickupKm = routeLengthKm(pickupRoute) || 1.4;
  const tripKm = routeLengthKm(tripRoute) || 3.6;
  const tripMin = estimateEtaMinutes(tripKm);
  const fare = fareBreakdown(tripKm, VEHICLES[0]);

  const startPin = pickupRoute[0] || DRIVER_START;
  const [online, setOnline] = useState(false);
  const [stage, setStage] = useState("idle");
  const [driverPos, setDriverPos] = useState(startPin);
  const [bearing, setBearing] = useState(0);
  const [progress, setProgress] = useState(0);
  const [seconds, setSeconds] = useState(ACCEPT_SECONDS);
  const [earned, setEarned] = useState(null);
  const backRef = useRef("idle");

  useEffect(() => {
    if (!online || stage !== "idle") return undefined;
    const timer = setTimeout(() => setStage("incoming"), 1200);
    return () => clearTimeout(timer);
  }, [online, stage]);

  useEffect(() => {
    if (stage !== "incoming") return undefined;
    setSeconds(ACCEPT_SECONDS);
    const tick = setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          clearInterval(tick);
          setStage("idle");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [stage]);

  useEffect(() => {
    if (stage !== "to-pickup") return undefined;
    const path = pickupRoute;
    let step = 0;
    const steps = 18;
    const anim = setInterval(() => {
      step += 1;
      const t = Math.min(step / steps, 1);
      const pos = pointAlong(path, t);
      const ahead = pointAlong(path, Math.min(1, t + 0.04));
      if (pos) setDriverPos(pos);
      if (pos && ahead) setBearing(bearingDeg(pos, ahead));
      setProgress(t);
      if (t >= 1) {
        clearInterval(anim);
        setStage("arrived");
      }
    }, 420);
    return () => clearInterval(anim);
  }, [stage, pickupRoute]);

  useEffect(() => {
    if (stage !== "in-trip") return undefined;
    const path = tripRoute;
    let step = 0;
    const steps = 20;
    const anim = setInterval(() => {
      step += 1;
      const t = Math.min(step / steps, 1);
      const pos = pointAlong(path, t);
      const ahead = pointAlong(path, Math.min(1, t + 0.04));
      if (pos) setDriverPos(pos);
      if (pos && ahead) setBearing(bearingDeg(pos, ahead));
      setProgress(t);
      if (t >= 1) {
        clearInterval(anim);
        setStage("dropoff");
      }
    }, 420);
    return () => clearInterval(anim);
  }, [stage, tripRoute]);

  function goOffline() {
    setOnline(false);
    setStage("idle");
    setProgress(0);
    setDriverPos(startPin);
  }

  function goOnline() {
    setOnline(true);
    setStage("idle");
    setProgress(0);
    setDriverPos(startPin);
    const ahead = pointAlong(pickupRoute, 0.08);
    if (ahead) setBearing(bearingDeg(startPin, ahead));
  }

  function acceptJob() {
    setProgress(0);
    setDriverPos(startPin);
    setStage("to-pickup");
  }

  function declineJob() {
    setStage("idle");
  }

  function openToday() {
    backRef.current = stage;
    setStage("today");
  }

  function closeToday() {
    const back = backRef.current;
    setStage(back && back !== "today" ? back : "idle");
  }

  const dayTrips = useMemo(() => {
    const list = [...TODAY_TRIPS];
    if (earned) {
      list.unshift({
        id: job.id,
        time: "Now",
        from: job.pickup.name,
        to: job.dropoff.name,
        earn: earned,
        km: tripKm,
      });
    }
    return list;
  }, [earned, job, tripKm]);

  const dayEarn = dayTrips.reduce((sum, trip) => sum + trip.earn, 0);
  const dayKm = dayTrips.reduce((sum, trip) => sum + trip.km, 0);

  const mapRoute =
    stage === "to-pickup" || stage === "arrived"
      ? pickupRoute
      : stage === "incoming" || stage === "in-trip" || stage === "dropoff" || stage === "complete"
        ? tripRoute
        : [];

  const showCar = online && stage !== "today";
  const showDrop = online && stage !== "idle" && stage !== "today";

  const status = !online
    ? "You are offline"
    : stage === "incoming"
      ? "New request"
      : stage === "to-pickup"
        ? "Heading to pickup"
        : stage === "arrived"
          ? "Arrived at pickup"
          : stage === "in-trip"
            ? "Trip in progress"
            : stage === "dropoff"
              ? "At the drop-off"
              : stage === "complete"
                ? "Trip complete"
                : stage === "today"
                  ? "Today"
                  : "Looking for requests";

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
      <p className="taxi-sr" aria-live="polite">{status}</p>
      <TaxiMap
        theme={theme}
        pickup={online && stage !== "today" ? job.pickup : null}
        pickupLabel={job.pickup.name}
        dropoff={showDrop ? job.dropoff : null}
        dropoffLabel={job.dropoff.name}
        driverPos={showCar ? driverPos : null}
        bearing={bearing}
        route={online && stage !== "today" ? mapRoute : []}
        fitRoute={online && mapRoute.length > 1 && stage !== "today"}
      />

      {stage === "today" ? (
        <section className="taxi-today" aria-labelledby="today-title">
          <p className="taxi-kicker">Today</p>
          <h2 id="today-title">Sample earnings</h2>
          <p className="taxi-earn">{formatZar(dayEarn)}</p>
          <dl className="taxi-metrics taxi-metrics-3">
            <div>
              <dt>Trips</dt>
              <dd>{dayTrips.length}</dd>
            </div>
            <div>
              <dt>Distance</dt>
              <dd>{formatKm(dayKm)}</dd>
            </div>
            <div>
              <dt>Online</dt>
              <dd>{online ? "Yes" : "No"}</dd>
            </div>
          </dl>
          <ul className="taxi-day-list">
            {dayTrips.map((trip) => (
              <li key={trip.id}>
                <span>
                  <strong>{trip.time} · {trip.id}</strong>
                  <small>{trip.from} to {trip.to}</small>
                </span>
                <em>{formatZar(trip.earn)}</em>
              </li>
            ))}
          </ul>
          <button type="button" className="taxi-cta" onClick={closeToday}>
            Back to the map
          </button>
        </section>
      ) : (
        <BottomSheet labelledBy="drive-sheet-title">
          {!online && (
            <>
              <h2 id="drive-sheet-title" className="taxi-sheet-title">You&apos;re offline</h2>
              <p className="taxi-sheet-sub">Go online to receive requests in the City Bowl.</p>
              <div className="taxi-earn-row">
                <span>Today</span>
                <strong>{formatZar(dayEarn)}</strong>
              </div>
              <p className="taxi-fine">{dayTrips.length} trips · {formatKm(dayKm)}</p>
              <button type="button" className="taxi-cta" onClick={goOnline}>Go online</button>
              <button type="button" className="taxi-cta-secondary" onClick={openToday}>Today</button>
            </>
          )}

          {online && stage === "idle" && (
            <>
              <h2 id="drive-sheet-title" className="taxi-sheet-title">Looking nearby</h2>
              <p className="taxi-sheet-sub">A request will arrive in a moment.</p>
              <div className="taxi-skeleton" aria-hidden="true"><span /><span /></div>
            </>
          )}

          {online && stage === "incoming" && (
            <>
              <div className="taxi-request-head">
                <h2 id="drive-sheet-title" className="taxi-sheet-title">New request</h2>
                <div
                  className="taxi-count"
                  style={{ "--p": (seconds / ACCEPT_SECONDS) * 100 }}
                  aria-live="polite"
                  aria-label={`${seconds} seconds to accept`}
                >
                  <span>{seconds}</span>
                </div>
              </div>
              <p className="taxi-kicker">Trip {job.id}</p>
              <p className="taxi-person-name">{job.riderName}</p>
              <p className="taxi-sheet-sub">{job.notes}</p>
              <p className="taxi-person-meta">
                {job.partner.colour} {job.partner.vehicle}
              </p>
              <p className="taxi-plate">{job.partner.plate}</p>
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
                {formatKm(pickupKm)} to pickup · {formatKm(tripKm)} trip · about {tripMin} min
              </p>
              <div className="taxi-earn-row">
                <span>Sample fare</span>
                <strong>{formatZar(fare.total)}</strong>
              </div>
              <button type="button" className="taxi-cta" onClick={acceptJob}>Accept</button>
              <button type="button" className="taxi-cta-secondary" onClick={declineJob}>Decline</button>
            </>
          )}

          {online && stage === "to-pickup" && (
            <>
              <h2 id="drive-sheet-title" className="taxi-sheet-title">Heading to pickup</h2>
              <p className="taxi-sheet-sub">{job.pickup.name} · {job.pickup.subtitle}</p>
              <p className="taxi-eta">{formatKm(Math.max(0.1, pickupKm * (1 - progress)))}</p>
              <div className="taxi-progress" aria-hidden="true">
                <span style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            </>
          )}

          {online && stage === "arrived" && (
            <>
              <h2 id="drive-sheet-title" className="taxi-sheet-title">You&apos;ve arrived</h2>
              <p className="taxi-sheet-sub">{job.riderName} is at {job.pickup.name}.</p>
              <p className="taxi-person-meta">{job.partner.colour} {job.partner.vehicle}</p>
              <p className="taxi-plate">{job.partner.plate}</p>
              <button type="button" className="taxi-cta" onClick={() => { setProgress(0); setStage("in-trip"); }}>
                Start trip
              </button>
            </>
          )}

          {online && stage === "in-trip" && (
            <>
              <h2 id="drive-sheet-title" className="taxi-sheet-title">On trip</h2>
              <p className="taxi-sheet-sub">
                Drop-off {job.dropoff.name} · about {Math.max(1, Math.round(tripMin * (1 - progress)))} min
              </p>
              <div className="taxi-progress" aria-hidden="true">
                <span style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            </>
          )}

          {online && stage === "dropoff" && (
            <>
              <h2 id="drive-sheet-title" className="taxi-sheet-title">At the drop-off</h2>
              <p className="taxi-sheet-sub">{job.dropoff.name} · {job.dropoff.subtitle}</p>
              <button
                type="button"
                className="taxi-cta"
                onClick={() => {
                  setEarned(fare.total);
                  setStage("complete");
                }}
              >
                Complete trip
              </button>
            </>
          )}

          {online && stage === "complete" && (
            <>
              <h2 id="drive-sheet-title" className="taxi-sheet-title">Trip complete</h2>
              <p className="taxi-kicker">Sample earnings</p>
              <p className="taxi-earn">{formatZar(earned || fare.total)}</p>
              <p className="taxi-sheet-sub">
                Trip {job.id} · {job.pickup.name} to {job.dropoff.name} · {formatKm(tripKm)}
              </p>
              <p className="taxi-fine">{job.partner.vehicle} · {job.partner.plate}</p>
              <button type="button" className="taxi-cta" onClick={openToday}>See today</button>
              <button
                type="button"
                className="taxi-cta-secondary"
                onClick={() => {
                  setStage("idle");
                  setProgress(0);
                  setDriverPos(job.dropoff);
                }}
              >
                Stay online
              </button>
            </>
          )}
        </BottomSheet>
      )}
    </TaxiChrome>
  );
}
