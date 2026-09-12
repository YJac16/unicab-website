import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DemoBanner from "../../components/taxi/DemoBanner";
import BottomSheet from "../../components/taxi/BottomSheet";
import TaxiMap from "../../components/taxi/TaxiMap";
import {
  LOCATIONS,
  DRIVERS,
  distanceKm,
  estimateEtaMinutes,
  fakePriceZAR,
  routePoints,
  lerpRoute,
} from "../../taxi/mockData";

export default function RiderApp() {
  const [stage, setStage] = useState("home");
  const [pickup] = useState(LOCATIONS[0]);
  const [destinationId, setDestinationId] = useState("");
  const [driver] = useState(DRIVERS[0]);
  const [waitEta, setWaitEta] = useState(4);
  const [driverPos, setDriverPos] = useState({ lat: driver.lat, lng: driver.lng });
  const [tripProgress, setTripProgress] = useState(0);
  const [rating, setRating] = useState(0);

  const destination = useMemo(
    () => LOCATIONS.find((l) => l.id === destinationId),
    [destinationId]
  );

  const km = destination ? distanceKm(pickup, destination) : 0;
  const etaMin = estimateEtaMinutes(km);
  const price = fakePriceZAR(km);
  const route = useMemo(
    () => (destination ? routePoints(pickup, destination) : []),
    [pickup, destination]
  );

  useEffect(() => {
    if (stage !== "waiting") return;
    setWaitEta(4);
    const tick = setInterval(() => {
      setWaitEta((v) => {
        if (v <= 1) {
          clearInterval(tick);
          setStage("in-trip");
          return 0;
        }
        return v - 1;
      });
    }, 1200);
    return () => clearInterval(tick);
  }, [stage]);

  useEffect(() => {
    if (stage !== "waiting") return;
    const start = { lat: driver.lat, lng: driver.lng };
    const end = pickup;
    let step = 0;
    const anim = setInterval(() => {
      step += 1;
      const t = Math.min(step / 8, 1);
      setDriverPos(lerpRoute(start, end, t));
      if (t >= 1) clearInterval(anim);
    }, 400);
    return () => clearInterval(anim);
  }, [stage, driver, pickup]);

  useEffect(() => {
    if (stage !== "in-trip" || !destination) return;
    setTripProgress(0);
    let step = 0;
    const anim = setInterval(() => {
      step += 1;
      const t = Math.min(step / 14, 1);
      setTripProgress(t);
      setDriverPos(lerpRoute(pickup, destination, t));
      if (t >= 1) {
        clearInterval(anim);
        setTimeout(() => setStage("done"), 600);
      }
    }, 500);
    return () => clearInterval(anim);
  }, [stage, pickup, destination]);

  function handleConfirm() {
    if (!destination) return;
    setStage("confirm");
  }

  function handleRequestRide() {
    setStage("waiting");
  }

  function handleNewRide() {
    setDestinationId("");
    setRating(0);
    setTripProgress(0);
    setDriverPos({ lat: driver.lat, lng: driver.lng });
    setStage("home");
  }

  return (
    <div className="taxi-app">
      <DemoBanner />
      <header className="taxi-header">
        <Link to="/" className="taxi-header-back" aria-label="Back to home">
          ←
        </Link>
        <span className="taxi-header-title">UNICAB Ride</span>
        <span className="taxi-header-spacer" />
      </header>

      <TaxiMap
        pickup={stage !== "home" ? pickup : null}
        dropoff={destination && stage !== "home" ? destination : null}
        driverPos={stage === "waiting" || stage === "in-trip" ? driverPos : null}
        route={stage === "confirm" || stage === "waiting" || stage === "in-trip" ? route : []}
        fitRoute={stage === "confirm" || stage === "waiting"}
      />

      <BottomSheet>
        {stage === "home" && (
          <>
            <h2 className="taxi-sheet-title">Where to?</h2>
            <p className="taxi-sheet-sub">Pickup: {pickup.name}</p>
            <ul className="taxi-dest-list">
              {LOCATIONS.filter((l) => l.id !== pickup.id).map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    className={`taxi-dest-btn ${destinationId === loc.id ? "selected" : ""}`}
                    onClick={() => setDestinationId(loc.id)}
                  >
                    <span className="taxi-dest-name">{loc.name}</span>
                    <span className="taxi-dest-sub">{loc.subtitle}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="taxi-cta"
              disabled={!destinationId}
              onClick={handleConfirm}
            >
              Continue
            </button>
          </>
        )}

        {stage === "confirm" && destination && (
          <>
            <h2 className="taxi-sheet-title">Confirm your trip</h2>
            <div className="taxi-trip-summary">
              <div className="taxi-trip-row">
                <span className="taxi-trip-dot pickup" />
                <div>
                  <div className="taxi-trip-label">Pickup</div>
                  <div>{pickup.name}</div>
                </div>
              </div>
              <div className="taxi-trip-row">
                <span className="taxi-trip-dot dropoff" />
                <div>
                  <div className="taxi-trip-label">Drop-off</div>
                  <div>{destination.name}</div>
                </div>
              </div>
            </div>
            <div className="taxi-meta-row">
              <span>{etaMin} min ETA</span>
              <span className="taxi-price">R{price}</span>
            </div>
            <p className="taxi-sheet-sub">All-in estimate · demo pricing</p>
            <button type="button" className="taxi-cta" onClick={handleRequestRide}>
              Request UNICAB
            </button>
            <button type="button" className="taxi-cta-secondary" onClick={() => setStage("home")}>
              Change destination
            </button>
          </>
        )}

        {stage === "waiting" && (
          <>
            <h2 className="taxi-sheet-title">Driver on the way</h2>
            <div className="taxi-driver-card">
              <img src={driver.photo} alt="" className="taxi-driver-photo" />
              <div>
                <div className="taxi-driver-name">{driver.name}</div>
                <div className="taxi-driver-meta">{driver.plate} · {driver.vehicle}</div>
                <div className="taxi-driver-uniform">{driver.uniform}</div>
              </div>
            </div>
            <p className="taxi-eta-big">{waitEta > 0 ? `${waitEta} min` : "Arriving now"}</p>
          </>
        )}

        {stage === "in-trip" && destination && (
          <>
            <h2 className="taxi-sheet-title">On trip</h2>
            <p className="taxi-sheet-sub">Heading to {destination.name}</p>
            <div className="taxi-progress-bar">
              <div className="taxi-progress-fill" style={{ width: `${tripProgress * 100}%` }} />
            </div>
            <div className="taxi-driver-card compact">
              <img src={driver.photo} alt="" className="taxi-driver-photo small" />
              <div>
                <div className="taxi-driver-name">{driver.name}</div>
                <div className="taxi-driver-meta">{driver.plate}</div>
              </div>
            </div>
          </>
        )}

        {stage === "done" && (
          <>
            <h2 className="taxi-sheet-title">Trip complete</h2>
            <p className="taxi-sheet-sub">How was your ride with {driver.name}?</p>
            <div className="taxi-stars" role="group" aria-label="Rate your driver">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`taxi-star ${rating >= n ? "active" : ""}`}
                  onClick={() => setRating(n)}
                  aria-label={`${n} stars`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && <p className="taxi-thanks">Thanks for riding with UNICAB!</p>}
            <button type="button" className="taxi-cta" onClick={handleNewRide}>
              Book another ride
            </button>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
