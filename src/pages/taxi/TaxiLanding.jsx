import React from "react";
import { Link } from "react-router-dom";
import DemoBanner from "../../components/taxi/DemoBanner";

export default function TaxiLanding() {
  return (
    <div className="taxi-app">
      <DemoBanner />
      <main className="taxi-landing">
        <div className="taxi-landing-hero">
          <img src="/logo-black.png" alt="UNICAB" className="taxi-landing-logo" />
          <h1>UNICAB TAXI</h1>
          <p className="taxi-landing-tagline">
            Premium ride-hail for Cape Town — investor pitch demo
          </p>
        </div>

        <div className="taxi-landing-cards">
          <Link to="/ride" className="taxi-role-card taxi-role-card-rider">
            <span className="taxi-role-icon" aria-hidden="true">🚕</span>
            <span className="taxi-role-title">Ride as passenger</span>
            <span className="taxi-role-desc">Book a trip, track your driver, rate the ride</span>
          </Link>
          <Link to="/drive" className="taxi-role-card taxi-role-card-driver">
            <span className="taxi-role-icon" aria-hidden="true">🧑‍✈️</span>
            <span className="taxi-role-title">Drive as partner</span>
            <span className="taxi-role-desc">Go online, accept jobs, complete trips</span>
          </Link>
        </div>

        <p className="taxi-landing-footnote">
          Simulated data only — no live GPS or payments. Travel &amp; Tours brochure is a separate Vercel project.
        </p>
      </main>
    </div>
  );
}
