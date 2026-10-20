import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/taxi/Logo";
import DemoBadge from "../../components/taxi/DemoBadge";
import ThemeToggle from "../../components/taxi/ThemeToggle";
import useTaxiTheme from "../../taxi/useTaxiTheme";
import { SAMPLE_GO_FARE, formatZar } from "../../taxi/mockData";

const ROLES = [
  {
    to: "/ride",
    kicker: "Passenger",
    title: "Book a ride",
    text: "Set a pickup and drop-off, compare fares, and confirm in a few taps.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 15h16l-1.2-4.2A2 2 0 0 0 16.9 9H7.1a2 2 0 0 0-1.9 1.8L4 15z" />
        <path d="M6 15v2.2M18 15v2.2M7.5 18.5h.01M16.5 18.5h.01" />
      </svg>
    ),
  },
  {
    to: "/drive",
    kicker: "Partner",
    title: "Drive a shift",
    text: "Go online, accept a request, and finish the trip with earnings for the day.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3" />
        <path d="M6 19.2c.8-2.6 3-4 6-4s5.2 1.4 6 4" />
      </svg>
    ),
  },
  {
    to: "/dispatch",
    kicker: "Operations",
    title: "Open dispatch",
    text: "Watch requests come in and put a partner on each one.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 9h8M8 12h8M8 15h5" />
      </svg>
    ),
  },
];

export default function TaxiLanding() {
  const { theme, toggleTheme } = useTaxiTheme();

  return (
    <div className="taxi-app taxi-scroll" data-theme={theme}>
      <a className="taxi-skip" href="#taxi-main">
        Skip to content
      </a>
      <header className="taxi-header taxi-header-landing">
        <Logo theme={theme} className="taxi-logo-landing" />
        <div className="taxi-header-tools">
          <DemoBadge />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main id="taxi-main" className="taxi-landing">
        <section className="taxi-hero">
          <div className="taxi-hero-copy">
            <p className="taxi-kicker">Taxi · Cape Town</p>
            <h1>A quieter way across the city.</h1>
            <p className="taxi-lede">Book in seconds. Track your partner. Pay your way.</p>
            <ul className="taxi-stats" aria-label="City figures">
              <li>
                <strong>4 min</strong>
                <span>typical arrival</span>
              </li>
              <li>
                <strong>3</strong>
                <span>vehicle classes</span>
              </li>
              <li>
                <strong>1 city</strong>
                <span>Cape Town</span>
              </li>
            </ul>
          </div>
          <div className="taxi-phone" aria-hidden="true">
            <div className="taxi-phone-screen">
              <div className="taxi-phone-map" />
              <div className="taxi-phone-sheet">
                <span className="taxi-phone-handle" />
                <strong>Where to?</strong>
                <span className="taxi-phone-row"><i className="pickup" />Cape Town CBD</span>
                <span className="taxi-phone-row"><i className="dropoff" />V&amp;A Waterfront</span>
                <span className="taxi-phone-fare">UNICAB Go · {formatZar(SAMPLE_GO_FARE.total)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="taxi-roles" aria-label="Demo roles">
          {ROLES.map((role) => (
            <Link key={role.to} to={role.to} className="taxi-role-card">
              <span className="taxi-role-icon">{role.icon}</span>
              <span className="taxi-kicker">{role.kicker}</span>
              <span className="taxi-role-title">{role.title}</span>
              <span className="taxi-role-text">{role.text}</span>
              <span className="taxi-role-go">
                Enter
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          ))}
        </section>

        <p className="taxi-landing-note">Demo with sample data</p>
      </main>
    </div>
  );
}
