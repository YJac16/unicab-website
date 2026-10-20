import React, { useEffect, useMemo, useState } from "react";
import TaxiChrome from "../../components/taxi/TaxiChrome";
import BottomSheet from "../../components/taxi/BottomSheet";
import TaxiMap from "../../components/taxi/TaxiMap";
import PlaceField from "../../components/taxi/PlaceField";
import useTaxiTheme from "../../taxi/useTaxiTheme";
import {
  LOCATIONS,
  VEHICLES,
  distanceKm,
  estimateEtaMinutes,
  fareBreakdown,
  formatKm,
  formatZar,
  routePoints,
  lerpRoute,
  driverForClass,
  getLocationById,
} from "../../taxi/mockData";

const QUICK_DROPS = ["waterfront", "airport", "campsbay", "seapoint"];

export default function RiderApp() {
  const { theme, toggleTheme } = useTaxiTheme();
  const [stage, setStage] = useState("plan");
  const [pickupId, setPickupId] = useState("cbd");
  const [dropoffId, setDropoffId] = useState("");
  const [vehicleId, setVehicleId] = useState("go");
  const [waitEta, setWaitEta] = useState(4);
  const [tripProgress, setTripProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [driverPos, setDriverPos] = useState(null);

  const pickup = getLocationById(pickupId);
  const dropoff = getLocationById(dropoffId);
  const vehicle = VEHICLES.find((item) => item.id === vehicleId) || VEHICLES[0];
  const driver = driverForClass(vehicle.id);
  const samePlace = Boolean(pickup && dropoff && pickup.id === dropoff.id);
  const km = pickup && dropoff && !samePlace ? distanceKm(pickup, dropoff) : 0;
  const tripMin = estimateEtaMinutes(km);
  const fare = vehicle ? fareBreakdown(km, vehicle) : null;
  const route = useMemo(
    () => (pickup && dropoff && !samePlace ? routePoints(pickup, dropoff) : []),
    [pickup, dropoff, samePlace]
  );

  useEffect(() => {
    if (stage !== "matching") return undefined;
    const timer = setTimeout(() => {
      setWaitEta(4 + vehicle.etaAdd);
      setDriverPos({ lat: driver.lat, lng: driver.lng });
      setStage("waiting");
    }, 1600);
    return () => clearTimeout(timer);
  }, [stage, driver.lat, driver.lng, vehicle.etaAdd]);

  useEffect(() => {
    if (stage !== "waiting" || !pickup) return undefined;
    setWaitEta(4 + vehicle.etaAdd);
    const tick = setInterval(() => {
      setWaitEta((value) => {
        if (value <= 1) {
          clearInterval(tick);
          setStage("in-trip");
          return 0;
        }
        return value - 1;
      });
    }, 1100);
    return () => clearInterval(tick);
  }, [stage, pickup, vehicle.etaAdd]);

  useEffect(() => {
    if (stage !== "waiting" || !pickup) return undefined;
    const start = { lat: driver.lat, lng: driver.lng };
    let step = 0;
    const anim = setInterval(() => {
      step += 1;
      const t = Math.min(step / 8, 1);
      setDriverPos(lerpRoute(start, pickup, t));
      if (t >= 1) clearInterval(anim);
    }, 380);
    return () => clearInterval(anim);
  }, [stage, driver.lat, driver.lng, pickup]);

  useEffect(() => {
    if (stage !== "in-trip" || !pickup || !dropoff) return undefined;
    setTripProgress(0);
    let step = 0;
    const anim = setInterval(() => {
      step += 1;
      const t = Math.min(step / 14, 1);
      setTripProgress(t);
      setDriverPos(lerpRoute(pickup, dropoff, t));
      if (t >= 1) {
        clearInterval(anim);
        setTimeout(() => setStage("done"), 500);
      }
    }, 480);
    return () => clearInterval(anim);
  }, [stage, pickup, dropoff]);

  function resetRide() {
    setDropoffId("");
    setVehicleId("go");
    setRating(0);
    setNote("");
    setTripProgress(0);
    setDriverPos(null);
    setStage("plan");
  }

  const showRoute = stage === "vehicles" || stage === "confirm" || stage === "matching" || stage === "waiting" || stage === "in-trip";
  const status =
    stage === "plan"
      ? "Choose a pickup and drop-off"
      : stage === "vehicles"
        ? "Choose a vehicle"
        : stage === "confirm"
          ? "Review the sample trip"
          : stage === "matching"
            ? "Finding a sample partner"
            : stage === "waiting"
              ? "Partner is on the way"
              : stage === "in-trip"
                ? "Trip in progress"
                : "Trip complete";

  return (
    <TaxiChrome theme={theme} onToggleTheme={toggleTheme} backLabel="Back to UNICAB home">
      <h1 className="taxi-sr">Book a UNICAB ride</h1>
      <p className="taxi-sr" aria-live="polite">
        {status}
      </p>
      <TaxiMap
        theme={theme}
        pickup={pickup}
        dropoff={showRoute ? dropoff : null}
        driverPos={stage === "waiting" || stage === "in-trip" ? driverPos : null}
        route={showRoute ? route : []}
        fitRoute={showRoute && route.length > 1}
      />

      <BottomSheet labelledBy="ride-sheet-title">
        {stage === "plan" && (
          <>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Where to?
            </h2>
            <p className="taxi-sheet-sub">Sample places around Cape Town. Your pin is not live GPS.</p>
            <div className="taxi-route-card">
              <div className="taxi-route-rail" aria-hidden="true">
                <span className="taxi-rail-dot pickup" />
                <span className="taxi-rail-line" />
                <span className="taxi-rail-dot dropoff" />
              </div>
              <div className="taxi-route-fields">
                <PlaceField
                  id="pickup"
                  label="Pickup"
                  places={LOCATIONS}
                  value={pickupId}
                  onChange={setPickupId}
                  excludeId={dropoffId}
                />
                <PlaceField
                  id="dropoff"
                  label="Drop-off"
                  places={LOCATIONS}
                  value={dropoffId}
                  onChange={setDropoffId}
                  excludeId={pickupId}
                />
              </div>
            </div>
            {!dropoffId && (
              <div className="taxi-quick">
                <p className="taxi-quick-label">Sample drop-offs</p>
                <div className="taxi-chips">
                  {QUICK_DROPS.map((id) => {
                    const place = getLocationById(id);
                    if (!place || place.id === pickupId) return null;
                    return (
                      <button key={id} type="button" className="taxi-chip" onClick={() => setDropoffId(id)}>
                        {place.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {samePlace && (
              <p className="taxi-alert" role="alert">
                Choose two different sample places.
              </p>
            )}
            {!dropoffId && (
              <p className="taxi-empty-inline">Add a drop-off to see sample fares and vehicle classes.</p>
            )}
            <button
              type="button"
              className="taxi-cta"
              disabled={!pickup || !dropoff || samePlace}
              onClick={() => setStage("vehicles")}
            >
              See sample fares
            </button>
          </>
        )}

        {stage === "vehicles" && dropoff && fare && (
          <>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Choose a vehicle
            </h2>
            <p className="taxi-sheet-sub">
              {pickup.name} to {dropoff.name} · {formatKm(km)} · about {tripMin} min
            </p>
            <div className="taxi-vehicles" role="radiogroup" aria-label="Vehicle class">
              {VEHICLES.map((option) => {
                const price = fareBreakdown(km, option);
                const selected = option.id === vehicleId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`taxi-vehicle ${selected ? "is-selected" : ""}`}
                    onClick={() => setVehicleId(option.id)}
                  >
                    <span>
                      <span className="taxi-vehicle-name">{option.name}</span>
                      <span className="taxi-vehicle-detail">
                        {option.detail} · {option.seats} seats
                      </span>
                      <span className="taxi-vehicle-detail">
                        {option.blurb} · arrival ~{4 + option.etaAdd} min
                      </span>
                    </span>
                    <span className="taxi-vehicle-price">{formatZar(price.total)}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" className="taxi-cta" onClick={() => setStage("confirm")}>
              Review trip
            </button>
            <button type="button" className="taxi-cta-secondary" onClick={() => setStage("plan")}>
              Edit route
            </button>
          </>
        )}

        {stage === "confirm" && dropoff && fare && (
          <>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Confirm sample ride
            </h2>
            <ol className="taxi-stops">
              <li>
                <span className="taxi-stop-label">Pickup</span>
                <span>{pickup.name}</span>
              </li>
              <li>
                <span className="taxi-stop-label">Drop-off</span>
                <span>{dropoff.name}</span>
              </li>
            </ol>
            <dl className="taxi-fare">
              <div>
                <dt>Base</dt>
                <dd>{formatZar(fare.base)}</dd>
              </div>
              <div>
                <dt>Distance · {formatKm(km)}</dt>
                <dd>{formatZar(fare.distance)}</dd>
              </div>
              <div>
                <dt>{vehicle.name}</dt>
                <dd>{vehicle.seats} seats</dd>
              </div>
              <div className="taxi-fare-total">
                <dt>Sample estimate</dt>
                <dd>{formatZar(fare.total)}</dd>
              </div>
            </dl>
            <fieldset className="taxi-pay">
              <legend>Payment</legend>
              <label className="is-selected">
                <input type="radio" name="pay" checked readOnly />
                <span>Cash to partner</span>
                <small>Sample method</small>
              </label>
              <label>
                <input type="radio" name="pay" disabled />
                <span>Card</span>
                <small>Not available in this demo</small>
              </label>
            </fieldset>
            <p className="taxi-fine">No card is charged and this trip is not saved.</p>
            <button type="button" className="taxi-cta" onClick={() => setStage("matching")}>
              Confirm sample ride
            </button>
            <button type="button" className="taxi-cta-secondary" onClick={() => setStage("vehicles")}>
              Change vehicle
            </button>
          </>
        )}

        {stage === "matching" && (
          <div aria-busy="true">
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Finding a partner
            </h2>
            <p className="taxi-sheet-sub">Matching you with a sample {vehicle.name} nearby.</p>
            <div className="taxi-skeleton" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {stage === "waiting" && (
          <>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Partner on the way
            </h2>
            <p className="taxi-eta">{waitEta > 0 ? `${waitEta} min` : "Arriving"}</p>
            <article className="taxi-person">
              <img src={driver.photo} alt="" />
              <div>
                <p className="taxi-person-name">{driver.name}</p>
                <p className="taxi-person-meta">
                  {driver.colour} {driver.vehicle} · {driver.plate}
                </p>
                <p className="taxi-person-meta">
                  {driver.rating.toFixed(2)} · {driver.trips.toLocaleString("en-ZA")} sample trips
                </p>
              </div>
            </article>
            <p className="taxi-fine">Sample partner. Calling and messaging are not connected.</p>
            <button type="button" className="taxi-cta-secondary" onClick={resetRide}>
              Cancel sample ride
            </button>
          </>
        )}

        {stage === "in-trip" && dropoff && (
          <>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              On trip
            </h2>
            <p className="taxi-sheet-sub">
              Heading to {dropoff.name} · about {Math.max(1, Math.round(tripMin * (1 - tripProgress)))} min left
            </p>
            <div className="taxi-progress" aria-hidden="true">
              <span style={{ width: `${Math.round(tripProgress * 100)}%` }} />
            </div>
            <p className="taxi-fine">{Math.round(tripProgress * 100)}% of the sample route</p>
            <article className="taxi-person compact">
              <img src={driver.photo} alt="" />
              <div>
                <p className="taxi-person-name">{driver.name}</p>
                <p className="taxi-person-meta">{driver.plate}</p>
              </div>
            </article>
          </>
        )}

        {stage === "done" && dropoff && fare && (
          <>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Trip complete
            </h2>
            <p className="taxi-sheet-sub">How was the sample ride with {driver.name}?</p>
            <div className="taxi-stars" role="group" aria-label="Rate your partner">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  className={rating >= score ? "is-on" : ""}
                  aria-pressed={rating >= score}
                  aria-label={`${score} star${score === 1 ? "" : "s"}`}
                  onClick={() => setRating(score)}
                >
                  ★
                </button>
              ))}
            </div>
            <label className="taxi-note-label" htmlFor="ride-note">
              Note for this demo
            </label>
            <textarea
              id="ride-note"
              className="taxi-note"
              maxLength={160}
              value={note}
              placeholder="Optional. Stays in this browser tab only."
              onChange={(event) => setNote(event.target.value)}
            />
            <dl className="taxi-fare taxi-receipt">
              <div>
                <dt>{vehicle.name}</dt>
                <dd>{formatZar(fare.total)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Not charged</dd>
              </div>
            </dl>
            {rating > 0 && <p className="taxi-thanks">Thanks for trying UNICAB.</p>}
            <button type="button" className="taxi-cta" onClick={resetRide}>
              Book another sample ride
            </button>
          </>
        )}
      </BottomSheet>
    </TaxiChrome>
  );
}
