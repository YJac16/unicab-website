import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TaxiChrome from "../../components/taxi/TaxiChrome";
import TaxiMap from "../../components/taxi/TaxiMap";
import useTaxiTheme from "../../taxi/useTaxiTheme";
import {
  assignDriver,
  assignNearest,
  busyDriverIds,
  assignStaticTrip,
  patchSession,
  rankPartners,
  useDemoSession,
  useStaticAssigns,
} from "../../taxi/demoSession";
import { DISPATCH_TRIPS, DRIVERS, LOCATIONS, formatKm, formatZar, getLocationById } from "../../taxi/mockData";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "request", label: "Requests" },
  { id: "assigned", label: "Assigned" },
  { id: "enroute", label: "En route" },
  { id: "done", label: "Done" },
];

const STATUS_LABEL = {
  request: "Needs a partner",
  assigned: "Assigned",
  enroute: "En route",
  done: "Complete",
};

function placeByName(name) {
  return LOCATIONS.find((place) => place.name === name) || null;
}

function liveStatus(phase) {
  if (phase === "requested") return "request";
  if (phase === "assigned") return "assigned";
  if (phase === "accepted" || phase === "arrived" || phase === "started") return "enroute";
  if (phase === "complete" || phase === "rated") return "done";
  return "";
}

export default function DispatchApp() {
  const { theme, toggleTheme } = useTaxiTheme();
  const session = useDemoSession();
  const staticAssigns = useStaticAssigns();
  const [loading, setLoading] = useState(true);
  const localTrips = useMemo(() => DISPATCH_TRIPS.filter((trip) => trip.id !== "T-1048"), []);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (session.notice) setNotice(session.notice);
  }, [session.notice]);

  const liveTrip = useMemo(() => {
    const status = liveStatus(session.phase);
    if (!status) return null;
    const pickup = getLocationById(session.pickupId);
    const dropoff = getLocationById(session.dropoffId);
    const vehicle = session.vehicleId === "comfort" ? "UNICAB Comfort" : session.vehicleId === "xl" ? "UNICAB XL" : "UNICAB Go";
    const base = DISPATCH_TRIPS.find((trip) => trip.id === "T-1048");
    return {
      id: "T-1048",
      status,
      rider: "Sam K.",
      pickup: pickup?.name || "Cape Town CBD",
      dropoff: dropoff?.name || "V&A Waterfront",
      pickupId: session.pickupId,
      dropoffId: session.dropoffId,
      vehicle,
      classId: session.vehicleId,
      estimate: base?.estimate || 88,
      when: "Sample request",
      driverId: session.driverId,
      live: true,
    };
  }, [session]);

  const trips = useMemo(() => {
    const stamped = localTrips.map((trip) => {
      const driverId = staticAssigns[trip.id];
      if (driverId && trip.status === "request") {
        return { ...trip, status: "assigned", driverId, when: "Just assigned" };
      }
      return trip;
    });
    const list = liveTrip ? [liveTrip, ...stamped] : stamped;
    return [...list].sort((a, b) => {
      const rank = { request: 0, assigned: 1, enroute: 2, done: 3 };
      return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
    });
  }, [liveTrip, localTrips, staticAssigns]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return trips.filter((trip) => {
      if (filter !== "all" && trip.status !== filter) return false;
      if (!needle) return true;
      return `${trip.id} ${trip.rider} ${trip.pickup} ${trip.dropoff} ${trip.vehicle}`.toLowerCase().includes(needle);
    });
  }, [trips, filter, query]);

  const openTrips = trips.filter((trip) => trip.status === "request");
  const openCount = openTrips.length;
  const liveCount = trips.filter((trip) => trip.status === "assigned" || trip.status === "enroute").length;
  const busy = busyDriverIds(session, staticAssigns);
  const focusTrip = openTrips[0];
  const focusPickup = focusTrip ? placeByName(focusTrip.pickup) : getLocationById(session.pickupId || "cbd");
  const focusClass = focusTrip
    ? (focusTrip.classId || (String(focusTrip.vehicle).includes("Comfort") ? "comfort" : String(focusTrip.vehicle).includes("XL") ? "xl" : "go"))
    : (session.vehicleId || "go");
  const fleetRank = rankPartners(focusPickup, { classId: focusClass, busyIds: busy });
  const nearestId = fleetRank.find((row) => !row.busy)?.driver.id || "";
  const fleetById = Object.fromEntries(fleetRank.map((row) => [row.driver.id, row]));

  const mapMarkers = useMemo(() => {
    const markers = DRIVERS.map((driver) => ({
      id: driver.id,
      lat: driver.lat,
      lng: driver.lng,
      label: driver.initials,
      kind: busy.has(driver.id) ? "trip" : "online",
      alt: `${driver.name} ${busy.has(driver.id) ? "on a trip" : "available"}`,
    }));
    openTrips.forEach((trip) => {
      const place = placeByName(trip.pickup);
      if (!place) return;
      markers.push({
        id: trip.id,
        lat: place.lat,
        lng: place.lng,
        label: trip.id,
        kind: "request",
        alt: `Open request ${trip.id} at ${place.name}`,
      });
    });
    return markers;
  }, [openTrips, busy]);

  function assign(tripId, driverId) {
    if (!driverId) return;
    if (tripId === "T-1048") {
      assignDriver(driverId);
      return;
    }
    const driver = DRIVERS.find((item) => item.id === driverId);
    assignStaticTrip(tripId, driverId);
    setNotice(`${tripId} assigned to ${driver?.name || "a partner"}. Sample only.`);
  }

  function assignClosest(trip) {
    if (trip.id === "T-1048") {
      assignNearest();
      return;
    }
    const pickup = placeByName(trip.pickup);
    const classId = trip.classId || (String(trip.vehicle).includes("Comfort") ? "comfort" : String(trip.vehicle).includes("XL") ? "xl" : "go");
    const ranked = rankPartners(pickup, { classId, busyIds: busy });
    const pick = ranked.find((row) => !row.busy) || ranked[0];
    if (pick) assign(trip.id, pick.driver.id);
  }

  function demoCall(tripId) {
    const message = `Call on ${tripId} is a demo. Nothing is dialled.`;
    setNotice(message);
    patchSession({ notice: message });
  }

  return (
    <TaxiChrome theme={theme} onToggleTheme={toggleTheme} scroll>
      <main className="taxi-dispatch">
        <header className="taxi-dispatch-intro">
          <p className="taxi-kicker">Operations · sample</p>
          <h1>Dispatch</h1>
          <p>Rank partners by pickup time, then assign the nearest.</p>
          <Link to="/control" className="taxi-inline-link">Open the control room</Link>
        </header>

        <aside className="taxi-dispatch-side" aria-label="Sample fleet">
          <div className="taxi-dispatch-map">
            <TaxiMap theme={theme} embedded markers={mapMarkers} fitRoute boundsMode="even" maxZoom={13} />
          </div>
          <dl className="taxi-metrics">
            <div>
              <dt>Open requests</dt>
              <dd>{openCount}</dd>
            </div>
            <div>
              <dt>On a trip</dt>
              <dd>{liveCount}</dd>
            </div>
            <div>
              <dt>Partners online</dt>
              <dd>{DRIVERS.length}</dd>
            </div>
          </dl>
          <ul className="taxi-fleet">
            {DRIVERS.map((driver) => {
              const row = fleetById[driver.id];
              const nearest = driver.id === nearestId;
              return (
                <li key={driver.id} className={nearest ? "is-nearest" : ""}>
                  <span className="taxi-avatar" aria-hidden="true">{driver.initials}</span>
                  <span>
                    <strong>
                      {driver.name}
                      {nearest && <span className="taxi-nearest"> Nearest</span>}
                    </strong>
                    <small>{driver.vehicle} · {driver.plate}</small>
                    {row && <small>{row.eta} min · {formatKm(row.km)}</small>}
                  </span>
                  <em>{busy.has(driver.id) ? "On trip" : "Online"}</em>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="taxi-dispatch-board" aria-labelledby="board-title">
          {openTrips.length > 0 && (
            <section className="taxi-panel taxi-dispatch-alerts" aria-label="Unassigned requests">
              <h2>Unassigned</h2>
              <ul className="taxi-alerts">
                {openTrips.map((trip) => (
                  <li key={trip.id}>
                    <span className="taxi-status taxi-status-request">Unassigned</span>
                    <p>{trip.id} · {trip.rider} at {trip.pickup}</p>
                    <small>{trip.vehicle} · {formatZar(trip.estimate)} · {trip.when}</small>
                    <div className="taxi-alert-actions">
                      <button type="button" className="taxi-cta taxi-cta-inline" onClick={() => assignClosest(trip)}>
                        Assign nearest
                      </button>
                      <button type="button" className="taxi-decline taxi-decline-inline" onClick={() => demoCall(trip.id)}>
                        Call <span className="taxi-demo-tag">Demo</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="taxi-board-bar">
            <h2 id="board-title">Sample trips</h2>
            <label className="taxi-sr" htmlFor="trip-search">Search sample trips</label>
            <input
              id="trip-search"
              className="taxi-search"
              placeholder="Search rider, place, or trip"
              value={query}
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="taxi-filters" role="toolbar" aria-label="Filter sample trips">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={filter === item.id ? "is-on" : ""}
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {notice && <p className="taxi-notice" role="status">{notice}</p>}

          {loading && (
            <div className="taxi-skeleton tall" aria-busy="true" aria-label="Loading sample board">
              <span /><span /><span />
            </div>
          )}

          {!loading && visible.length === 0 && (
            <div className="taxi-empty-block">
              <div className="taxi-empty-mark" aria-hidden="true" />
              <p>No trips match this view.</p>
              <button type="button" className="taxi-cta-secondary" onClick={() => { setQuery(""); setFilter("all"); }}>
                Clear filters
              </button>
            </div>
          )}

          {!loading && (
            <ul className="taxi-trip-list">
              {visible.map((trip) => {
                const driver = DRIVERS.find((item) => item.id === trip.driverId);
                const pickup = placeByName(trip.pickup);
                const classId = trip.classId || (trip.vehicle.includes("Comfort") ? "comfort" : trip.vehicle.includes("XL") ? "xl" : "go");
                const ranked = rankPartners(pickup, { classId, busyIds: busy }).slice(0, 3);
                return (
                  <li key={trip.id} className="taxi-trip-card">
                    <div className="taxi-trip-top">
                      <span className={`taxi-status taxi-status-${trip.status}`}>{STATUS_LABEL[trip.status]}</span>
                      <span className="taxi-trip-id">{trip.id}</span>
                    </div>
                    <p className="taxi-person-name">{trip.rider}</p>
                    <p className="taxi-person-meta">{trip.when}{trip.live ? " · sample" : ""}</p>
                    <ol className="taxi-stops">
                      <li><span className="taxi-stop-label">Pickup</span><span>{trip.pickup}</span></li>
                      <li><span className="taxi-stop-label">Drop-off</span><span>{trip.dropoff}</span></li>
                    </ol>
                    <p className="taxi-trip-fare">{trip.vehicle}<strong>{formatZar(trip.estimate)}</strong></p>
                    <p className="taxi-fine">Estimate</p>
                    {driver && <p className="taxi-person-meta">Partner · {driver.name}</p>}
                    {trip.status === "request" && (
                      <>
                        <button type="button" className="taxi-cta" onClick={() => assignClosest(trip)}>
                          Assign nearest
                        </button>
                        <ol className="taxi-rank">
                          {ranked.map((row, index) => (
                            <li key={row.driver.id}>
                              <span>{index + 1}. {row.driver.name}</span>
                              <small>{row.eta} min · {formatKm(row.km)}{row.busy ? " · on a trip" : ""}</small>
                            </li>
                          ))}
                        </ol>
                        <form
                          className="taxi-assign"
                          onSubmit={(event) => {
                            event.preventDefault();
                            const data = new FormData(event.currentTarget);
                            assign(trip.id, String(data.get("partner") || ""));
                          }}
                        >
                          <label htmlFor={`partner-${trip.id}`}>Or choose a partner</label>
                          <div>
                            <select id={`partner-${trip.id}`} name="partner" defaultValue={ranked[0]?.driver.id || ""}>
                              {ranked.map((row) => (
                                <option key={row.driver.id} value={row.driver.id}>
                                  {row.driver.name} · {row.eta} min
                                </option>
                              ))}
                            </select>
                            <button type="submit" className="taxi-cta taxi-cta-inline">Assign</button>
                          </div>
                        </form>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </TaxiChrome>
  );
}
