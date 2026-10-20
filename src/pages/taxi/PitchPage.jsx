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
        </header>

        <section className="taxi-pitch-grid" aria-label="Pitch points">
          <article>
            <h2>One trip, four screens</h2>
            <p>
              Trip T-1048 is Cape Town CBD to V&amp;A Waterfront on UNICAB Go. Confirm it as the passenger and the same request shows on dispatch, the partner phone, and the control room.
            </p>
            <p className="taxi-fine">Illustrative walkthrough. Sample riders and partners only.</p>
          </article>
          <article>
            <h2>Named partner</h2>
            <p>
              The passenger sees initials, a car colour, and the demo plate SAMPLE before the car moves. Call and message stay switched off in this demo.
            </p>
          </article>
          <article>
            <h2>A desk, not a black box</h2>
            <p>
              Dispatch ranks who is free by pickup time and distance, then assigns with one tap. The control room keeps unassigned requests in view.
            </p>
          </article>
        </section>

        <section className="taxi-pitch-panel" aria-labelledby="commission-title">
          <h2 id="commission-title">Commission model</h2>
          <p className="taxi-demo-tag">Illustrative</p>
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
          <h2 id="safety-title">Safety story</h2>
          <ol className="taxi-pitch-list">
            <li>The plate and trip id are on the passenger screen before the car is marked as arrived.</li>
            <li>Dispatch and the control room show the same trip id, so an unassigned request is visible to the desk.</li>
            <li>The SOS row in the control room is a placeholder. This demo does not contact anyone.</li>
          </ol>
          <p className="taxi-fine">No safety certification or incident rate is claimed here.</p>
        </section>

        <section className="taxi-pitch-panel" aria-labelledby="roadmap-title">
          <h2 id="roadmap-title">Roadmap</h2>
          <ol className="taxi-pitch-list">
            <li><strong>Now.</strong> This clickable sample: book, dispatch, drive, and watch the control room.</li>
            <li><strong>Next.</strong> Live GPS, a real partner onboarding, and payments beyond cash in the car.</li>
            <li><strong>Later.</strong> More than one city, once Cape Town is actually operating.</li>
          </ol>
          <p className="taxi-fine">Sequence only. No dates and no claim that later steps are built.</p>
          <Link to="/ride" className="taxi-cta taxi-cta-inline">Open the sample trip</Link>
        </section>
      </main>
    </TaxiChrome>
  );
}
