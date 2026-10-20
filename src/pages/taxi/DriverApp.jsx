import React, { useEffect, useMemo, useState } from "react";
import TaxiChrome from "../../components/taxi/TaxiChrome";
import BottomSheet from "../../components/taxi/BottomSheet";
import TaxiMap from "../../components/taxi/TaxiMap";
import SwipeConfirm from "../../components/taxi/SwipeConfirm";
import useTaxiTheme from "../../taxi/useTaxiTheme";
import {
  acceptSampleJob,
  completeSampleTrip,
  declineSampleJob,
  markArrived,
  startSampleTrip,
  useDemoSession,
} from "../../taxi/demoSession";
import {
  CANNED_DRIVER_JOB,
  CONTROL_CLOCK,
  DRIVER_START,
  SAMPLE_PARTNER,
  TODAY_TRIPS,
  VEHICLES,
  bearingDeg,
  estimateEtaMinutes,
  fareBreakdown,
  formatKm,
  formatZar,
  getLocationById,
  pointAlong,
  roadRoute,
  routeLengthKm,
} from "../../taxi/mockData";

const ACCEPT_SECONDS = 15;

const SAMPLE_SHIFT_HOURS = (12 + 20 / 60) - (7 + 40 / 60);

export default function DriverApp() {
  const { theme, toggleTheme } = useTaxiTheme();
  const session = useDemoSession();
  const pickupPlace = getLocationById(session.pickupId) || CANNED_DRIVER_JOB.pickup;
  const dropoffPlace = getLocationById(session.dropoffId) || CANNED_DRIVER_JOB.dropoff;
  const job = {
    ...CANNED_DRIVER_JOB,
    pickup: pickupPlace,
    dropoff: dropoffPlace,
    partner: session.driverId && session.driverId !== "thabo" ? CANNED_DRIVER_JOB.partner : SAMPLE_PARTNER,
  };
  const pickupRoute = useMemo(() => roadRoute(DRIVER_START, job.pickup), [job.pickup]);
  const tripRoute = useMemo(() => roadRoute(job.pickup, job.dropoff), [job.pickup, job.dropoff]);
  const pickupKm = routeLengthKm(pickupRoute) || 1.4;
  const tripKm = routeLengthKm(tripRoute) || 3.6;
  const tripMin = estimateEtaMinutes(tripKm);
  const fare = fareBreakdown(tripKm, VEHICLES[0]);

  const startPin = pickupRoute[0] || DRIVER_START;
  const [online, setOnline] = useState(false);
  const [showToday, setShowToday] = useState(false);
  const liveStage = {
    assigned: "incoming",
    accepted: "to-pickup",
    arrived: "arrived",
    started: "in-trip",
    complete: "complete",
    rated: "complete",
  }[session.phase];
  const stage = showToday ? "today" : liveStage || (online ? "idle" : "offline");
  const [driverPos, setDriverPos] = useState(startPin);
  const [bearing, setBearing] = useState(0);
  const [progress, setProgress] = useState(0);
  const [seconds, setSeconds] = useState(ACCEPT_SECONDS);
  const [earned, setEarned] = useState(null);

  useEffect(() => {
    if (liveStage) setOnline(true);
  }, [liveStage]);

  useEffect(() => {
    if (session.phase === "complete" || session.phase === "rated") setEarned(fare.total);
  }, [session.phase, fare.total]);

  useEffect(() => {
    if (stage !== "incoming") return undefined;
    setSeconds(ACCEPT_SECONDS);
    const tick = setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          clearInterval(tick);
          declineSampleJob();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [stage]);

  useEffect(() => {
    const path = stage === "to-pickup" || stage === "arrived" ? pickupRoute : stage === "in-trip" || stage === "complete" ? tripRoute : null;
    if (!path || path.length < 2 || stage === "arrived" || stage === "complete") {
      if (stage === "arrived") setDriverPos(job.pickup);
      if (stage === "complete") setDriverPos(job.dropoff);
      return undefined;
    }
    let step = 0;
    const steps = 18;
    const anim = setInterval(() => {
      step += 1;
      const cap = stage === "to-pickup" ? 0.9 : 0.94;
      const t = Math.min(step / steps, cap);
      const pos = pointAlong(path, t);
      const ahead = pointAlong(path, Math.min(1, t + 0.04));
      if (pos) setDriverPos(pos);
      if (pos && ahead) setBearing(bearingDeg(pos, ahead));
      setProgress(t);
    }, 420);
    return () => clearInterval(anim);
  }, [stage, pickupRoute, tripRoute, job.pickup, job.dropoff]);

  function goOffline() {
    setOnline(false);
    setShowToday(false);
    setProgress(0);
    setDriverPos(startPin);
  }

  function goOnline() {
    setOnline(true);
    setShowToday(false);
    setProgress(0);
    setDriverPos(startPin);
    const ahead = pointAlong(pickupRoute, 0.08);
    if (ahead) setBearing(bearingDeg(startPin, ahead));
  }

  function openToday() {
    setShowToday(true);
  }

  function closeToday() {
    setShowToday(false);
  }

  const recordedEarn = earned || ((session.phase === "complete" || session.phase === "rated") ? fare.total : null);
  const dayTrips = useMemo(() => {
    const list = [...TODAY_TRIPS];
    if (recordedEarn) {
      list.unshift({
        id: job.id,
        time: "Now",
        from: job.pickup.name,
        to: job.dropoff.name,
        earn: recordedEarn,
        km: tripKm,
      });
    }
    return list;
  }, [recordedEarn, job, tripKm]);

  const dayEarn = dayTrips.reduce((sum, trip) => sum + trip.earn, 0);
  const perHour = Math.round(dayEarn / SAMPLE_SHIFT_HOURS);
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
          <span className="taxi-online-dot" aria-hidden="true" />
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
              <dt>Earnings / hr</dt>
              <dd>{formatZar(perHour)}</dd>
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
          <p className="taxi-fine">Sample day through {CONTROL_CLOCK}. Illustrative hourly figure.</p>
          <button type="button" className="taxi-cta" onClick={closeToday}>
            Back to the map
          </button>
        </section>
      ) : (
        <BottomSheet labelledBy="drive-sheet-title">
          {stage === "offline" && (
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

          {stage === "idle" && (
            <>
              <h2 id="drive-sheet-title" className="taxi-sheet-title">Looking nearby</h2>
              <p className="taxi-sheet-sub">
                {session.phase === "requested"
                  ? "T-1048 is on dispatch and still unassigned."
                  : "A request appears here after dispatch assigns you."}
              </p>
              <div className="taxi-skeleton" aria-hidden="true"><span /><span /></div>
            </>
          )}

          {stage === "incoming" && (
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
              <button type="button" className="taxi-cta" onClick={() => { setProgress(0); acceptSampleJob(); }}>Accept</button>
              <button type="button" className="taxi-decline" onClick={declineSampleJob}>Decline</button>
            </>
          )}

          {stage === "to-pickup" && (
            <>
              <h2 id="drive-sheet-title" className="taxi-sheet-title">Heading to pickup</h2>
              <p className="taxi-sheet-sub">{job.pickup.name} · {job.pickup.subtitle}</p>
              <p className="taxi-eta">{formatKm(Math.max(0.1, pickupKm * (1 - progress)))}</p>
              <div className="taxi-progress" aria-hidden="true">
                <span style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <SwipeConfirm label="Slide to confirm arrived" confirmLabel="Confirm arrived" onConfirm={() => { setProgress(0); markArrived(); }} />
            </>
          )}

          {stage === "arrived" && (
            <>
              <h2 id="drive-sheet-title" className="taxi-sheet-title">You&apos;ve arrived</h2>
              <p className="taxi-sheet-sub">{job.riderName} is at {job.pickup.name}.</p>
              <p className="taxi-person-meta">{job.partner.colour} {job.partner.vehicle}</p>
              <p className="taxi-plate">{job.partner.plate}</p>
              <SwipeConfirm label="Slide to start trip" confirmLabel="Confirm start" onConfirm={() => { setProgress(0); startSampleTrip(); }} />
            </>
          )}

          {stage === "in-trip" && (
            <>
              <h2 id="drive-sheet-title" className="taxi-sheet-title">On trip</h2>
              <p className="taxi-sheet-sub">
                Drop-off {job.dropoff.name} · about {Math.max(1, Math.round(tripMin * (1 - progress)))} min
              </p>
              <div className="taxi-progress" aria-hidden="true">
                <span style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <SwipeConfirm label="Slide to complete trip" confirmLabel="Confirm complete" onConfirm={() => { setEarned(fare.total); completeSampleTrip(); }} />
            </>
          )}

          {stage === "complete" && (
            <>
              <h2 id="drive-sheet-title" className="taxi-sheet-title">Trip complete</h2>
              <p className="taxi-kicker">Sample earnings</p>
              <p className="taxi-earn">{formatZar(earned || fare.total)}</p>
              <p className="taxi-sheet-sub">
                {formatZar(fare.total)} added for trip {job.id}. Today is now {formatZar(dayEarn)} across {dayTrips.length} trips.
              </p>
              <p className="taxi-fine">
                {job.pickup.name} to {job.dropoff.name} · {formatKm(tripKm)} · illustrative {formatZar(perHour)} an hour
              </p>
              <button type="button" className="taxi-cta" onClick={openToday}>See today</button>
              <button
                type="button"
                className="taxi-cta-secondary"
                onClick={() => {
                  setProgress(0);
                  setDriverPos(job.dropoff);
                }}
              >
                Stay on this sample
              </button>
            </>
          )}
        </BottomSheet>
      )}
    </TaxiChrome>
  );
}
