import React, { useEffect, useMemo, useState } from "react";
import TaxiChrome from "../../components/taxi/TaxiChrome";
import BottomSheet from "../../components/taxi/BottomSheet";
import TaxiMap from "../../components/taxi/TaxiMap";
import PlaceField from "../../components/taxi/PlaceField";
import useTaxiTheme from "../../taxi/useTaxiTheme";
import {
  LOCATIONS,
  VEHICLES,
  DRIVERS,
  DRIVER_START,
  SAMPLE_PARTNER,
  SAMPLE_TRIP_ID,
  estimateEtaMinutes,
  fareBreakdown,
  formatKm,
  formatZar,
  roadRoute,
  pointAlong,
  bearingDeg,
  routeLengthKm,
  driverForClass,
  getLocationById,
} from "../../taxi/mockData";
import { confirmSampleRide, pickupMinutes, rankPartners, resetSample, patchSession, useDemoSession } from "../../taxi/demoSession";

const QUICK_DROPS = ["waterfront", "airport", "campsbay", "seapoint"];
const TIPS = [0, 10, 20, 40];

function initialsFor(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const PHASE_STAGE = {
  requested: "matching",
  assigned: "assigned",
  accepted: "waiting",
  arrived: "arrived",
  started: "in-trip",
  complete: "arrival",
  rated: "receipt",
};

export default function RiderApp() {
  const { theme, toggleTheme } = useTaxiTheme();
  const session = useDemoSession();
  const [localStage, setLocalStage] = useState("plan");
  const stage = session.phase === "complete" && localStage === "rate"
    ? "rate"
    : (PHASE_STAGE[session.phase] || localStage);
  const [pickupId, setPickupId] = useState("cbd");
  const [dropoffId, setDropoffId] = useState("");
  const [vehicleId, setVehicleId] = useState("go");
  const [waitEta, setWaitEta] = useState(4);
  const [tripProgress, setTripProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [bearing, setBearing] = useState(0);

  const pickup = getLocationById(pickupId);
  const dropoff = getLocationById(dropoffId);
  const vehicle = VEHICLES.find((item) => item.id === vehicleId) || VEHICLES[0];
  const assignedDriver = DRIVERS.find((item) => item.id === session.driverId);
  const fleetDriver = assignedDriver || driverForClass(vehicle.id);
  const partner = fleetDriver.id === SAMPLE_PARTNER.id
    ? SAMPLE_PARTNER
    : { ...fleetDriver, initials: fleetDriver.initials || initialsFor(fleetDriver.name), plate: fleetDriver.plate };
  const partnerEta = pickup
    ? (rankPartners(pickup, { classId: vehicle.id }).find((row) => row.driver.id === fleetDriver.id)?.eta
      || pickupMinutes(1.2) + vehicle.etaAdd)
    : 4 + vehicle.etaAdd;
  const samePlace = Boolean(pickup && dropoff && pickup.id === dropoff.id);
  const sampleTrip = Boolean(
    pickup?.id === "cbd" && dropoff?.id === "waterfront" && vehicle.id === "go"
  );
  const tripId = sampleTrip ? SAMPLE_TRIP_ID : "T-1102";
  const route = useMemo(
    () => (pickup && dropoff && !samePlace ? roadRoute(pickup, dropoff) : []),
    [pickup, dropoff, samePlace]
  );
  const approach = useMemo(
    () => (pickup ? roadRoute(DRIVER_START, pickup) : []),
    [pickup]
  );
  const km = route.length > 1 ? routeLengthKm(route) : 0;
  const tripMin = estimateEtaMinutes(km);
  const fare = vehicle && km ? fareBreakdown(km, vehicle) : null;
  const tipAmount = tip ?? 0;
  const receiptTotal = fare ? fare.total + tipAmount : 0;

  useEffect(() => {
    if (session.phase === "idle") return;
    setPickupId(session.pickupId);
    setDropoffId(session.dropoffId);
    setVehicleId(session.vehicleId);
    setRating(session.rating || 0);
    if (session.tip != null) setTip(session.tip);
  }, [session]);

  useEffect(() => {
    const path = stage === "waiting" ? approach : stage === "in-trip" ? route : null;
    if (!path || path.length < 2) {
      if (stage === "arrived" && pickup) setDriverPos(pickup);
      if ((stage === "arrival" || stage === "rate" || stage === "receipt") && dropoff) setDriverPos(dropoff);
      return undefined;
    }
    let step = 0;
    const steps = stage === "waiting" ? 16 : 18;
    const anim = setInterval(() => {
      step += 1;
      const cap = stage === "waiting" ? 0.92 : 0.96;
      const t = Math.min(step / steps, cap);
      const pos = pointAlong(path, t);
      const ahead = pointAlong(path, Math.min(1, t + 0.04));
      if (pos) setDriverPos(pos);
      if (pos && ahead) setBearing(bearingDeg(pos, ahead));
      if (stage === "waiting") setWaitEta(Math.max(1, Math.ceil(partnerEta * (1 - t))));
      if (stage === "in-trip") setTripProgress(t);
    }, 420);
    return () => clearInterval(anim);
  }, [stage, approach, route, pickup, dropoff, partnerEta]);

  function resetRide() {
    resetSample();
    setDropoffId("");
    setVehicleId("go");
    setRating(0);
    setTip(null);
    setTripProgress(0);
    setDriverPos(null);
    setLocalStage("plan");
  }

  const drawnRoute = stage === "waiting" ? approach : route;
  const showRoute = stage !== "plan" && drawnRoute.length > 1;
  const showCar = stage === "waiting" || stage === "arrived" || stage === "in-trip" || stage === "arrival";
  const minutesLeft = Math.max(1, Math.round(tripMin * (1 - tripProgress)));
  const status =
    stage === "plan"
      ? "Choose a pickup and drop-off"
      : stage === "vehicles"
        ? "Choose a vehicle"
        : stage === "confirm"
          ? "Review your trip"
          : stage === "matching"
            ? "Assigning a partner"
            : stage === "assigned"
              ? "Waiting for the partner to accept"
            : stage === "waiting"
              ? "Partner is on the way"
              : stage === "arrived"
                ? "Partner has arrived"
                : stage === "in-trip"
                  ? "Trip in progress"
                  : stage === "arrival"
                    ? "You have arrived"
                    : stage === "rate"
                      ? "Rate your ride"
                      : "Receipt";

  return (
    <TaxiChrome theme={theme} onToggleTheme={toggleTheme} backLabel="Back to UNICAB home">
      <h1 className="taxi-sr">Book a UNICAB ride</h1>
      <p className="taxi-sr" aria-live="polite">
        {status}
      </p>
      <TaxiMap
        theme={theme}
        pickup={pickup}
        pickupLabel={pickup?.name}
        dropoff={stage !== "plan" && stage !== "waiting" ? dropoff : null}
        dropoffLabel={dropoff?.name}
        driverPos={showCar ? driverPos : null}
        bearing={bearing}
        route={showRoute ? drawnRoute : []}
        fitRoute={showRoute}
      />

      <BottomSheet labelledBy="ride-sheet-title">
        {stage === "plan" && (
          <>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Where to?
            </h2>
            <p className="taxi-sheet-sub">Cape Town. Set a pickup and a drop-off.</p>
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
                <p className="taxi-quick-label">Popular drop-offs</p>
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
                Choose two different places.
              </p>
            )}
            {!dropoffId && (
              <p className="taxi-empty-inline">Add a drop-off to see fares and vehicles.</p>
            )}
            <button
              type="button"
              className="taxi-cta"
              disabled={!pickup || !dropoff || samePlace}
              onClick={() => setLocalStage("vehicles")}
            >
              See fares
            </button>
          </>
        )}

        {stage === "vehicles" && dropoff && fare && (
          <>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Compare classes
            </h2>
            <p className="taxi-sheet-sub">
              {pickup.name} to {dropoff.name} · {formatKm(km)} · about {tripMin} min
            </p>
            <div className="taxi-route-fields taxi-route-edit">
              <PlaceField id="pickup-edit" label="Pickup" places={LOCATIONS} value={pickupId} onChange={setPickupId} excludeId={dropoffId} />
              <PlaceField id="dropoff-edit" label="Drop-off" places={LOCATIONS} value={dropoffId} onChange={setDropoffId} excludeId={pickupId} />
            </div>
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
                        {option.blurb} · arrives in {4 + option.etaAdd} min
                      </span>
                    </span>
                    <span className="taxi-vehicle-price">{formatZar(price.total)}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" className="taxi-cta" onClick={() => setLocalStage("confirm")}>
              Review trip
            </button>
            <button type="button" className="taxi-cta-secondary" onClick={() => setLocalStage("plan")}>
              Edit route
            </button>
          </>
        )}

        {stage === "confirm" && dropoff && fare && (
          <>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Confirm ride
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
                <dt>Estimate</dt>
                <dd>{formatZar(fare.total)}</dd>
              </div>
            </dl>
            <fieldset className="taxi-pay">
              <legend>Payment</legend>
              <label className="is-selected">
                <input type="radio" name="pay" checked readOnly />
                <span>Cash to partner</span>
                <small>Pay in the car</small>
              </label>
              <label className="is-disabled">
                <input type="radio" name="pay" disabled />
                <span>Card</span>
                <small>Coming soon</small>
              </label>
            </fieldset>
            <p className="taxi-fine">Arrives in {4 + vehicle.etaAdd} min · {vehicle.name} · {formatZar(fare.total)}</p>
            <button
              type="button"
              className="taxi-cta"
              onClick={() => confirmSampleRide({ pickupId, dropoffId, vehicleId })}
            >
              Confirm ride
            </button>
            <button type="button" className="taxi-cta-secondary" onClick={() => setLocalStage("vehicles")}>
              Change vehicle
            </button>
          </>
        )}

        {stage === "matching" && (
          <div aria-busy="true">
            <p className="taxi-kicker">Trip {tripId} · sample</p>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Assigning a partner
            </h2>
            <p className="taxi-sheet-sub">This request is on the dispatch board. A partner has not accepted yet.</p>
            <div className="taxi-skeleton" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <button type="button" className="taxi-cta-secondary" onClick={resetRide}>
              Cancel ride
            </button>
          </div>
        )}

        {stage === "assigned" && (
          <div aria-busy="true">
            <p className="taxi-kicker">Trip {tripId} · sample</p>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Waiting for {partner.name}
            </h2>
            <p className="taxi-sheet-sub">Assigned. The partner still needs to accept. Arrives in {partnerEta} min after that.</p>
            <article className="taxi-person">
              <span className="taxi-avatar" aria-hidden="true">{partner.initials}</span>
              <div>
                <p className="taxi-person-name">{partner.name}</p>
                <p className="taxi-person-meta">{partner.vehicle}</p>
              </div>
            </article>
          </div>
        )}

        {stage === "waiting" && (
          <>
            <p className="taxi-kicker">Trip {tripId}</p>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Partner on the way
            </h2>
            <p className="taxi-eta">Arrives in {waitEta > 0 ? waitEta : partnerEta} min</p>
            <article className="taxi-person">
              <span className="taxi-avatar" aria-hidden="true">{partner.initials}</span>
              <div>
                <p className="taxi-person-name">{partner.name}</p>
                <p className="taxi-person-meta">
                  {partner.colour} {partner.vehicle}
                </p>
                <p className="taxi-plate">{partner.plate}</p>
              </div>
            </article>
            <button type="button" className="taxi-cta-secondary" onClick={resetRide}>
              Cancel ride
            </button>
          </>
        )}

        {stage === "arrived" && (
          <>
            <p className="taxi-kicker">Trip {tripId}</p>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Partner has arrived
            </h2>
            <p className="taxi-sheet-sub">{pickup.name} · {pickup.subtitle}</p>
            <article className="taxi-person">
              <span className="taxi-avatar" aria-hidden="true">{partner.initials}</span>
              <div>
                <p className="taxi-person-name">{partner.name}</p>
                <p className="taxi-person-meta">
                  {partner.colour} {partner.vehicle}
                </p>
                <p className="taxi-person-meta">
                  {partner.rating.toFixed(2)} · {partner.trips.toLocaleString("en-ZA")} trips
                </p>
                <p className="taxi-plate">{partner.plate}</p>
              </div>
            </article>
            <div className="taxi-contact">
              <button type="button" disabled>
                Call<span className="taxi-demo-tag">Demo</span>
              </button>
              <button type="button" disabled>
                Message<span className="taxi-demo-tag">Demo</span>
              </button>
            </div>
            <p className="taxi-fine">Waiting for the partner to start the sample trip.</p>
          </>
        )}

        {stage === "in-trip" && dropoff && (
          <>
            <p className="taxi-kicker">Trip {tripId}</p>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              On trip
            </h2>
            <p className="taxi-eta">{minutesLeft} min</p>
            <p className="taxi-sheet-sub">Heading to {dropoff.name}</p>
            <div
              className="taxi-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(tripProgress * 100)}
              aria-label="Trip progress"
            >
              <span style={{ width: `${Math.round(tripProgress * 100)}%` }} />
            </div>
            <article className="taxi-person compact">
              <span className="taxi-avatar" aria-hidden="true">{partner.initials}</span>
              <div>
                <p className="taxi-person-name">{partner.name}</p>
                <p className="taxi-plate">{partner.plate}</p>
              </div>
            </article>
          </>
        )}

        {stage === "arrival" && dropoff && fare && (
          <>
            <p className="taxi-kicker">Trip {tripId}</p>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              You&apos;ve arrived
            </h2>
            <p className="taxi-sheet-sub">{dropoff.name} · {dropoff.subtitle}</p>
            <div className="taxi-earn-row">
              <span>{vehicle.name}</span>
              <strong>{formatZar(fare.total)}</strong>
            </div>
            <p className="taxi-fine">Cash to partner · plate {partner.plate}</p>
            <button type="button" className="taxi-cta" onClick={() => setLocalStage("rate")}>
              Rate this ride
            </button>
          </>
        )}

        {stage === "rate" && dropoff && fare && (
          <>
            <p className="taxi-kicker">Trip {tripId}</p>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Rate your ride
            </h2>
            <p className="taxi-sheet-sub">How was the ride with {partner.name}?</p>
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
            <p className="taxi-quick-label">Tip</p>
            <div className="taxi-tips" role="group" aria-label="Tip">
              {TIPS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={tip === amount ? "is-selected" : ""}
                  aria-pressed={tip === amount}
                  onClick={() => setTip(amount)}
                >
                  {amount === 0 ? "R0" : formatZar(amount)}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="taxi-cta"
              onClick={() => {
                patchSession({ phase: "rated", rating, tip: tipAmount });
              }}
            >
              See receipt
            </button>
          </>
        )}

        {stage === "receipt" && dropoff && fare && (
          <>
            <p className="taxi-kicker">Trip {tripId}</p>
            <h2 id="ride-sheet-title" className="taxi-sheet-title">
              Receipt
            </h2>
            <p className="taxi-sheet-sub">
              {partner.name} · {partner.colour} {partner.vehicle}
            </p>
            <p className="taxi-plate">{partner.plate}</p>
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
                <dt>Tip</dt>
                <dd>{formatZar(tipAmount)}</dd>
              </div>
              <div className="taxi-fare-total">
                <dt>Total</dt>
                <dd>{formatZar(receiptTotal)}</dd>
              </div>
            </dl>
            <p className="taxi-fine">Cash to partner</p>
            <div className="taxi-stars" aria-label={`${rating || 0} of 5 stars`}>
              {[1, 2, 3, 4, 5].map((score) => (
                <span key={score} className={rating >= score ? "is-on" : ""} aria-hidden="true">★</span>
              ))}
            </div>
            {rating > 0 && <p className="taxi-thanks">Rated {rating} of 5 for {partner.name}</p>}
            <button type="button" className="taxi-cta" onClick={resetRide}>
              Book another ride
            </button>
          </>
        )}
      </BottomSheet>
    </TaxiChrome>
  );
}
