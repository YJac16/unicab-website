import React from "react";
import { Link } from "react-router-dom";
import TaxiChrome from "../../components/taxi/TaxiChrome";
import useTaxiTheme from "../../taxi/useTaxiTheme";
import { SAMPLE_GO_FARE, formatZar } from "../../taxi/mockData";

const FARE = SAMPLE_GO_FARE.total;
const PARTNER_SHARE = Math.round(FARE * 0.8);
const UNICAB_SHARE = FARE - PARTNER_SHARE;

export default function PitchPage() {
  const { theme, toggleTheme } = useTaxiTheme();

  return (
    <TaxiChrome theme={theme} onToggleTheme={toggleTheme} scroll backLabel="Back to UNICAB home">
      <main className="taxi-pitch">
        <header className="taxi-pitch-hero">
          <p className="taxi-kicker">Pitch · sample data</p>
          <h1>Why Unicab</h1>
          <p>
            A Cape Town ride-hail a small fleet can run: the passenger books, dispatch sees the request,
            and the partner accepts the same sample trip. Cash is paid in the car. Nothing on this page is a live operating statistic.
          </p>
          <Link to="/ride" className="taxi-cta taxi-cta-inline">Open the demo</Link>
        </header>

        <section className="taxi-pitch-strip" aria-label="Four screens from the demo">
          <div className="taxi-pitch-strip-head">
            <h2>Four screens</h2>
            <p className="taxi-pitch-label">Demonstrated</p>
          </div>
          <div className="taxi-pitch-screens">
            <article className="taxi-pitch-screen">
              <p className="taxi-kicker">Passenger</p>
              <strong>Where to?</strong>
              <span className="taxi-phone-row"><i className="pickup" />Cape Town CBD</span>
              <span className="taxi-phone-row"><i className="dropoff" />V&amp;A Waterfront</span>
              <span className="taxi-phone-fare">UNICAB Go · estimate {formatZar(FARE)}</span>
            </article>
            <article className="taxi-pitch-screen">
              <p className="taxi-kicker">Partner</p>
              <strong>New request</strong>
              <span>Trip T-1048 · Sam K.</span>
              <span className="taxi-pitch-screen-fare">Estimate {formatZar(FARE)}</span>
              <span className="taxi-pitch-chip">Accept</span>
            </article>
            <article className="taxi-pitch-screen">
              <p className="taxi-kicker">Dispatch</p>
              <strong>T-1048</strong>
              <span>Cape Town CBD</span>
              <span className="taxi-nearest">Nearest</span>
              <span className="taxi-pitch-chip">Assign nearest</span>
            </article>
            <article className="taxi-pitch-screen">
              <p className="taxi-kicker">Control room</p>
              <strong>Sample day</strong>
              <span>Trips and open requests update when T-1048 moves.</span>
              <span className="taxi-pitch-chip">Alerts</span>
            </article>
          </div>
          <p className="taxi-fine">These are the same screens as the clickable demo. Sample trip T-1048 only.</p>
        </section>

        <section className="taxi-pitch-grid" aria-label="Pitch points">
          <article>
            <p className="taxi-pitch-label">Demonstrated</p>
            <h2>One trip, four screens</h2>
            <p>
              Trip T-1048 is Cape Town CBD to V&amp;A Waterfront on UNICAB Go. Confirm it as the passenger and the same request shows on dispatch, the partner phone, and the control room.
            </p>
          </article>
          <article>
            <p className="taxi-pitch-label">Demonstrated</p>
            <h2>Named partner</h2>
            <p>
              The passenger sees initials, a car colour, and the demo plate SAMPLE before the car moves. Call and message stay switched off in this demo.
            </p>
          </article>
          <article>
            <p className="taxi-pitch-label">Demonstrated</p>
            <h2>A desk, not a black box</h2>
            <p>
              Dispatch ranks who is free by pickup time and distance, then assigns with one tap. The control room keeps unassigned requests in view.
            </p>
          </article>
        </section>

        <section className="taxi-pitch-panel" aria-labelledby="commission-title">
          <p className="taxi-pitch-label">Illustrative</p>
          <h2 id="commission-title">Commission model</h2>
          <p>
            Not a contracted rate. On the sample UNICAB Go fare of {formatZar(FARE)}, this sketch keeps {formatZar(PARTNER_SHARE)} with the partner and {formatZar(UNICAB_SHARE)} with Unicab. That is 80 / 20 on one sample fare, for the conversation only.
          </p>
          <dl className="taxi-fare">
            <div>
              <dt>Sample fare</dt>
              <dd>{formatZar(FARE)}</dd>
            </div>
            <div>
              <dt>Partner · illustrative 80%</dt>
              <dd>{formatZar(PARTNER_SHARE)}</dd>
            </div>
            <div>
              <dt>Unicab · illustrative 20%</dt>
              <dd>{formatZar(UNICAB_SHARE)}</dd>
            </div>
          </dl>
          <p className="taxi-fine">Illustrative model. Not a quote, not a city average, and not a payout.</p>
        </section>

        <section className="taxi-pitch-panel" aria-labelledby="safety-title">
          <p className="taxi-pitch-label">Roadmap</p>
          <h2 id="safety-title">Safety</h2>
          <p>
            Proposed, not operating. This demo does not certify safety, contact anyone, or report an incident rate.
          </p>
          <ol className="taxi-pitch-list">
            <li>Plate and trip id on the passenger screen before the car is marked as arrived. That part is in the demo.</li>
            <li>A shared trip id on dispatch and in the control room, so an unassigned request stays visible. That part is in the demo.</li>
            <li>SOS, live support, and incident handling are roadmap only. The control-room SOS row is a placeholder.</li>
          </ol>
        </section>

        <section className="taxi-pitch-panel" aria-labelledby="roadmap-title">
          <p className="taxi-pitch-label">Proposed</p>
          <h2 id="roadmap-title">Roadmap</h2>
          <ol className="taxi-pitch-list">
            <li><strong>Demonstrated.</strong> This clickable sample: book, dispatch, drive, and watch the control room.</li>
            <li><strong>Proposed.</strong> Live GPS, a real partner onboarding, and payments beyond cash in the car.</li>
            <li><strong>Proposed.</strong> More than one city, once Cape Town is actually operating.</li>
          </ol>
          <p className="taxi-fine">Sequence only. No dates and no claim that later steps are built.</p>
          <Link to="/ride" className="taxi-cta taxi-cta-inline">Open the demo</Link>
        </section>
      </main>
    </TaxiChrome>
  );
}
