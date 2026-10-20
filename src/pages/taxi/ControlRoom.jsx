import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TaxiChrome from "../../components/taxi/TaxiChrome";
import TaxiMap from "../../components/taxi/TaxiMap";
import useTaxiTheme from "../../taxi/useTaxiTheme";
import {
  CONTROL_CANCELLATIONS,
  CONTROL_CLOCK,
  CONTROL_DECLINES,
  CONTROL_EXTRA_COMPLETED,
  CONTROL_PICKUP_MINUTES,
  DISPATCH_TRIPS,
  DRIVERS,
  TODAY_TRIPS,
  VEHICLES,
  formatZar,
  getLocationById,
  pointAlong,
  roadRoute,
} from "../../taxi/mockData";

const HOURS = ["07", "08", "09", "10", "11", "12"];

const ROSTER = [
  { driverId: "andre", status: "trip", tripId: "T-1036", since: "14 min" },
  { driverId: "leah", status: "trip", tripId: "T-1042", since: "6 min" },
  { driverId: "zinhle", status: "online", tripId: "", since: "12 min" },
  { driverId: "thabo", status: "idle", tripId: "T-1028", since: "38 min" },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "trip", label: "On trip" },
  { id: "online", label: "Available" },
  { id: "idle", label: "Idle" },
];

const STATUS_LABEL = {
  trip: "On trip",
  online: "Available",
  idle: "Idle",
  request: "Needs a partner",
  assigned: "Assigned",
  enroute: "En route",
  done: "Complete",
};

function vehicleName(classId) {
  return VEHICLES.find((item) => item.id === classId)?.name || "UNICAB Go";
}

export default function ControlRoom() {
  const { theme, toggleTheme } = useTaxiTheme();
  const [filter, setFilter] = useState("all");

  const completed = useMemo(() => {
    const done = DISPATCH_TRIPS.find((trip) => trip.id === "T-1028");
    return [
      ...TODAY_TRIPS.map((trip) => ({
        id: trip.id,
        hour: trip.time.slice(0, 2),
        earn: trip.earn,
        classId: "go",
        driverId: "thabo",
      })),
      ...CONTROL_EXTRA_COMPLETED.map((trip) => ({
        ...trip,
        hour: trip.time.slice(0, 2),
      })),
      {
        id: done.id,
        hour: "11",
        earn: done.estimate,
        classId: "go",
        driverId: done.driverId,
      },
    ];
  }, []);

  const liveTrips = useMemo(
    () => DISPATCH_TRIPS.filter((trip) => trip.status !== "done"),
    []
  );

  const tripsToday = completed.length + liveTrips.length;
  const revenue = completed.reduce((sum, trip) => sum + trip.earn, 0);
  const pickupAvg = CONTROL_PICKUP_MINUTES.reduce((sum, value) => sum + value, 0) / CONTROL_PICKUP_MINUTES.length;
  const accepted = completed.length + liveTrips.filter((trip) => trip.driverId).length;
  const decided = accepted + CONTROL_CANCELLATIONS.length + CONTROL_DECLINES;
  const acceptance = Math.round((accepted / decided) * 100);

  const hours = HOURS.map((hour) => {
    const finished = completed.filter((trip) => trip.hour === hour).length;
    const startedNow = hour === "12" ? liveTrips.length : 0;
    return { hour, trips: finished + startedNow };
  });
  const hourMax = Math.max(...hours.map((item) => item.trips), 1);

  const byClass = VEHICLES.map((vehicle) => ({
    id: vehicle.id,
    name: vehicle.name.replace("UNICAB ", ""),
    amount: completed.filter((trip) => trip.classId === vehicle.id).reduce((sum, trip) => sum + trip.earn, 0),
  }));
  const classMax = Math.max(...byClass.map((item) => item.amount), 1);

  const partners = ROSTER.map((row) => {
    const driver = DRIVERS.find((item) => item.id === row.driverId);
    const trip = DISPATCH_TRIPS.find((item) => item.id === row.tripId);
    return { ...row, driver, trip };
  });
  const visiblePartners = partners.filter((row) => filter === "all" || row.status === filter);

  const mapModel = useMemo(() => buildMapModel(), []);

  return (
    <TaxiChrome theme={theme} onToggleTheme={toggleTheme} scroll backLabel="Back to UNICAB home">
      <main className="taxi-room">
        <header className="taxi-room-head">
          <div>
            <p className="taxi-kicker">Sample day · {CONTROL_CLOCK}</p>
            <h1>Control room</h1>
          </div>
          <Link to="/dispatch" className="taxi-inline-link">Dispatch board</Link>
        </header>

        <section className="taxi-kpis" aria-label="Sample day figures">
          <article>
            <p>Trips today</p>
            <strong>{tripsToday}</strong>
            <span>Started on the sample day</span>
          </article>
          <article>
            <p>Revenue today</p>
            <strong>{formatZar(revenue)}</strong>
            <span>Completed fares</span>
          </article>
          <article>
            <p>Avg pickup</p>
            <strong>{pickupAvg.toFixed(1)} min</strong>
            <span>{CONTROL_PICKUP_MINUTES.length} accepted trips</span>
          </article>
          <article>
            <p>Acceptance</p>
            <strong>{acceptance}%</strong>
            <span>{accepted} of {decided} offers</span>
          </article>
          <article>
            <p>Partners online</p>
            <strong>{partners.length}</strong>
            <span>of {DRIVERS.length} on the roster</span>
          </article>
          <article>
            <p>Cancellations</p>
            <strong>{CONTROL_CANCELLATIONS.length}</strong>
            <span>Sample day</span>
          </article>
        </section>

        <section className="taxi-room-main">
          <div className="taxi-room-map-card">
            <div className="taxi-room-map">
              <TaxiMap
                theme={theme}
                embedded
                fitRoute
                boundsMode="even"
                maxZoom={13}
                markers={mapModel.markers}
                polylines={mapModel.polylines}
              />
              <ul className="taxi-map-legend">
                <li><i className="is-trip" /> On trip</li>
                <li><i className="is-online" /> Available</li>
                <li><i className="is-idle" /> Idle</li>
                <li><i className="is-request" /> Open request</li>
              </ul>
            </div>
          </div>

          <div className="taxi-room-side">
            <section className="taxi-panel" aria-labelledby="alerts-title">
              <h2 id="alerts-title">Alerts</h2>
              <ul className="taxi-alerts">
                <li>
                  <span className="taxi-status taxi-status-request">Unassigned</span>
                  <p>T-1047 has waited 2 min at Sea Point.</p>
                  <small>Lerato D. · UNICAB Comfort · {formatZar(DISPATCH_TRIPS.find((trip) => trip.id === "T-1047").estimate)}</small>
                </li>
                <li>
                  <span className="taxi-status taxi-status-idle">Idle</span>
                  <p>Thabo M. has been idle since T-1028.</p>
                  <small>38 min · last drop-off Cape Town CBD</small>
                </li>
                <li>
                  <span className="taxi-status taxi-status-done">SOS</span>
                  <p>No active SOS. <span className="taxi-demo-tag">Demo</span></p>
                  <small>Placeholder only. Nothing is dispatched.</small>
                </li>
              </ul>
            </section>

            <section className="taxi-panel" aria-labelledby="feed-title">
              <h2 id="feed-title">Live trips</h2>
              <ul className="taxi-feed">
                {DISPATCH_TRIPS.map((trip) => {
                  const driver = DRIVERS.find((item) => item.id === trip.driverId);
                  return (
                    <li key={trip.id}>
                      <span>
                        <strong>{trip.id}</strong>
                        <small>{trip.rider} · {trip.pickup} to {trip.dropoff}</small>
                      </span>
                      <em>
                        {STATUS_LABEL[trip.status]}
                        <small>{driver ? driver.name : "Unassigned"} · {formatZar(trip.estimate)}</small>
                      </em>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </section>

        <section className="taxi-room-bottom">
          <article className="taxi-panel" aria-labelledby="hour-title">
            <h2 id="hour-title">Trips per hour</h2>
            <svg className="taxi-chart-svg" viewBox="0 0 320 148" role="img" aria-labelledby="hour-title hour-desc">
              <title id="hour-desc">
                {hours.map((item) => `${item.hour}:00, ${item.trips} trips`).join(". ")}
              </title>
              {hours.map((item, index) => {
                const width = 36;
                const gap = 14;
                const x = 16 + index * (width + gap);
                const height = Math.max(4, (item.trips / hourMax) * 96);
                const y = 110 - height;
                return (
                  <g key={item.hour}>
                    <rect className="taxi-chart-bar" x={x} y={y} width={width} height={height} rx="4" />
                    <text className="taxi-chart-value" x={x + width / 2} y={y - 6} textAnchor="middle">{item.trips}</text>
                    <text className="taxi-chart-label" x={x + width / 2} y="132" textAnchor="middle">{item.hour}</text>
                  </g>
                );
              })}
            </svg>
          </article>

          <article className="taxi-panel" aria-labelledby="class-title">
            <h2 id="class-title">Revenue by class</h2>
            <ul className="taxi-class-bars">
              {byClass.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <span className="taxi-hbar" aria-hidden="true">
                    <i style={{ width: `${Math.round((item.amount / classMax) * 100)}%` }} />
                  </span>
                  <strong>{formatZar(item.amount)}</strong>
                </li>
              ))}
            </ul>
            <p className="taxi-fine">Completed sample fares · {formatZar(revenue)}</p>
          </article>

          <article className="taxi-panel taxi-room-table" aria-labelledby="roster-title">
            <div className="taxi-room-table-head">
              <h2 id="roster-title">Partners</h2>
              <div className="taxi-filters" role="toolbar" aria-label="Filter partners">
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
            </div>
            {visiblePartners.length === 0 ? (
              <p className="taxi-fine">No partners in this view.</p>
            ) : (
              <div className="taxi-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Partner</th>
                      <th scope="col">Status</th>
                      <th scope="col">Vehicle</th>
                      <th scope="col">Plate</th>
                      <th scope="col">Trip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePartners.map((row) => (
                      <tr key={row.driverId}>
                        <th scope="row">
                          <span className="taxi-avatar" aria-hidden="true">{row.driver.initials}</span>
                          {row.driver.name}
                        </th>
                        <td><span className={`taxi-status taxi-status-${row.status}`}>{STATUS_LABEL[row.status]}</span></td>
                        <td>{vehicleName(row.driver.classId)}</td>
                        <td>{row.driver.plate}</td>
                        <td>{row.trip ? `${row.trip.id} · ${row.since}` : row.since}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </section>
      </main>
    </TaxiChrome>
  );
}

function buildMapModel() {
  const cbd = getLocationById("cbd");
  const sea = getLocationById("seapoint");
  const woodstock = getLocationById("woodstock");
  const camps = getLocationById("campsbay");
  const gardens = getLocationById("kirstenbosch");
  const leah = DRIVERS.find((driver) => driver.id === "leah");
  const zinhle = DRIVERS.find((driver) => driver.id === "zinhle");
  const andreRoute = roadRoute(camps, gardens);
  const leahRoute = roadRoute(leah, woodstock);
  const andrePos = pointAlong(andreRoute, 0.42) || camps;
  const leahPos = pointAlong(leahRoute, 0.55) || leah;

  const markers = [
    { id: "andre", lat: andrePos.lat, lng: andrePos.lng, label: "AP", kind: "trip", alt: "Andre P. on a trip" },
    { id: "leah", lat: leahPos.lat, lng: leahPos.lng, label: "LS", kind: "trip", alt: "Leah S. on a trip" },
    { id: "zinhle", lat: zinhle.lat, lng: zinhle.lng, label: "ZN", kind: "online", alt: "Zinhle N. available" },
    { id: "thabo", lat: cbd.lat + 0.006, lng: cbd.lng - 0.008, label: "TM", kind: "idle", alt: "Thabo M. idle" },
    { id: "T-1048", lat: cbd.lat, lng: cbd.lng, label: "T-1048", kind: "request", alt: "Open request T-1048 at Cape Town CBD" },
    { id: "T-1047", lat: sea.lat, lng: sea.lng, label: "T-1047", kind: "request", alt: "Open request T-1047 at Sea Point" },
  ];

  return {
    markers,
    polylines: [
      { id: "andre-route", points: andreRoute },
      { id: "leah-route", points: leahRoute, dashed: true },
    ],
  };
}
