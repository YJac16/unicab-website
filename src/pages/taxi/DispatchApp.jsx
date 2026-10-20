import React, { useEffect, useMemo, useState } from "react";
import TaxiChrome from "../../components/taxi/TaxiChrome";
import useTaxiTheme from "../../taxi/useTaxiTheme";
import { DISPATCH_TRIPS, DRIVERS, formatZar } from "../../taxi/mockData";

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

export default function DispatchApp() {
  const { theme, toggleTheme } = useTaxiTheme();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState(DISPATCH_TRIPS);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return trips.filter((trip) => {
      if (filter !== "all" && trip.status !== filter) return false;
      if (!needle) return true;
      return `${trip.id} ${trip.rider} ${trip.pickup} ${trip.dropoff} ${trip.vehicle}`.toLowerCase().includes(needle);
    });
  }, [trips, filter, query]);

  const openCount = trips.filter((trip) => trip.status === "request").length;
  const liveCount = trips.filter((trip) => trip.status === "assigned" || trip.status === "enroute").length;

  function assign(tripId, driverId) {
    if (!driverId) return;
    const driver = DRIVERS.find((item) => item.id === driverId);
    setTrips((current) =>
      current.map((trip) =>
        trip.id === tripId ? { ...trip, status: "assigned", driverId, when: "Just assigned" } : trip
      )
    );
    setNotice(`${tripId} assigned to ${driver?.name || "a partner"}.`);
  }

  return (
    <TaxiChrome theme={theme} onToggleTheme={toggleTheme} scroll>
      <main className="taxi-dispatch">
        <header className="taxi-dispatch-intro">
          <p className="taxi-kicker">Operations</p>
          <h1>Dispatch</h1>
          <p>Assign the nearest partner and keep Cape Town moving.</p>
        </header>

        <aside className="taxi-dispatch-side" aria-label="Sample fleet">
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
            {DRIVERS.map((driver) => (
              <li key={driver.id}>
                <span className="taxi-avatar" aria-hidden="true">{driver.initials}</span>
                <span>
                  <strong>{driver.name}</strong>
                  <small>
                    {driver.vehicle} · {driver.plate}
                  </small>
                </span>
                <em>Online</em>
              </li>
            ))}
          </ul>
        </aside>

        <section className="taxi-dispatch-board" aria-labelledby="board-title">
          <div className="taxi-board-bar">
            <h2 id="board-title">Sample trips</h2>
            <label className="taxi-sr" htmlFor="trip-search">
              Search sample trips
            </label>
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
          {notice && (
            <p className="taxi-notice" role="status">
              {notice}
            </p>
          )}

          {loading && (
            <div className="taxi-skeleton tall" aria-busy="true" aria-label="Loading sample board">
              <span />
              <span />
              <span />
            </div>
          )}

          {!loading && visible.length === 0 && (
            <div className="taxi-empty-block">
              <div className="taxi-empty-mark" aria-hidden="true" />
              <p>No trips match this view.</p>
              <button
                type="button"
                className="taxi-cta-secondary"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {!loading && (
            <ul className="taxi-trip-list">
              {visible.map((trip) => {
                const driver = DRIVERS.find((item) => item.id === trip.driverId);
                return (
                  <li key={trip.id} className="taxi-trip-card">
                    <div className="taxi-trip-top">
                      <span className={`taxi-status taxi-status-${trip.status}`}>{STATUS_LABEL[trip.status]}</span>
                      <span className="taxi-trip-id">{trip.id}</span>
                    </div>
                    <p className="taxi-person-name">{trip.rider}</p>
                    <p className="taxi-person-meta">{trip.when}</p>
                    <ol className="taxi-stops">
                      <li>
                        <span className="taxi-stop-label">Pickup</span>
                        <span>{trip.pickup}</span>
                      </li>
                      <li>
                        <span className="taxi-stop-label">Drop-off</span>
                        <span>{trip.dropoff}</span>
                      </li>
                    </ol>
                    <p className="taxi-trip-fare">
                      {trip.vehicle}
                      <strong>{formatZar(trip.estimate)}</strong>
                    </p>
                    <p className="taxi-fine">Estimate</p>
                    {driver && <p className="taxi-person-meta">Partner · {driver.name}</p>}
                    {trip.status === "request" && (
                      <form
                        className="taxi-assign"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const data = new FormData(event.currentTarget);
                          assign(trip.id, String(data.get("partner") || ""));
                        }}
                      >
                        <label htmlFor={`partner-${trip.id}`}>Assign a partner</label>
                        <div>
                          <select id={`partner-${trip.id}`} name="partner" defaultValue="">
                            <option value="" disabled>
                              Choose a partner
                            </option>
                            {DRIVERS.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} · {item.vehicle}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="taxi-cta taxi-cta-inline">
                            Assign
                          </button>
                        </div>
                      </form>
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
