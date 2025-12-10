import React, { useMemo, useState } from "react";
import { tours, vehicles, drivers, reviews, membershipPlans } from "./data";

const formatStars = (rating) => {
  const fullStars = Math.round(rating);
  return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
};

const navItems = [
  { id: "home", label: "Home" },
  { id: "tours", label: "Tours" },
  { id: "vehicles", label: "Vehicles" },
  { id: "drivers", label: "Drivers" },
  { id: "reviews", label: "Reviews" },
  { id: "membership", label: "Membership" },
  { id: "contact", label: "Contact" }
];

function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const year = useMemo(() => new Date().getFullYear(), []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    setNavOpen(false);
  };

  const validate = (payload) => {
    const nextErrors = {};
    if (!payload.name) nextErrors.name = "Please enter your name.";
    if (!payload.email) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!payload.phone) {
      nextErrors.phone = "Please provide a contact number.";
    } else if (payload.phone.replace(/\D/g, "").length < 7) {
      nextErrors.phone = "Please enter a valid phone number.";
    }
    if (!payload.pickup) nextErrors.pickup = "Please specify your pickup location.";
    if (!payload.dropoff) nextErrors.dropoff = "Please select a tour or transfer option.";
    if (!payload.date) nextErrors.date = "Please choose your pickup or tour date.";
    if (!payload.guests) {
      nextErrors.guests = "Please specify the number of guests.";
    } else if (Number.isNaN(Number(payload.guests)) || Number(payload.guests) < 1) {
      nextErrors.guests = "Guests must be at least 1.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg("");

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    payload.guests = Number(payload.guests);

    if (!validate(payload)) return;

    setSubmitting(true);
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setSuccessMsg(data.message);
          e.target.reset();
        } else {
          setSuccessMsg(data?.message || "Something went wrong. Please try again.");
        }
      })
      .catch(() => setSuccessMsg("Unable to send request right now. Please try again later."))
      .finally(() => setSubmitting(false));
  };

  const handleTourDetails = (tour) => {
    const text = `${tour.name}\n\nDuration: ${tour.duration}\nRating: ${tour.rating.toFixed(
      1
    )}/5\n${tour.priceFrom}\n\nHighlights:\n- ${tour.highlights.join(
      "\n- "
    )}\n\nDescription:\n${tour.description}`;
    alert(text);
  };

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#home" className="logo" aria-label="Cape Elite Transfers and Tours - Home">
            <span className="logo-main">Cape Elite</span>
            <span className="logo-sub">Transfers &amp; Tours</span>
          </a>

          <button
            className="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
          </button>

          <nav className={`main-nav ${navOpen ? "open" : ""}`} aria-label="Primary">
            <ul>
              {navItems.map((item) => (
                <li key={item.id}>
                  <a className="link-button" href={`#${item.id}`}>
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="cta-nav">
                <a className="btn btn-primary btn-compact" href="#contact">
                  Book Now
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section id="home" className="hero" aria-labelledby="hero-heading">
          <div className="hero-overlay"></div>
          <div className="container hero-inner hero-centered">
            <p className="eyebrow">Cape Town • Western Cape</p>
            <h1 id="hero-heading">Cape Elite Transfers &amp; Tours</h1>
            <p className="hero-subtitle">
              Private transfers and crafted tours across Cape Town and the Western Cape. Premium fleet, professional
              drivers, concierge-level service.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => scrollToSection("tours")}>
                Explore Tours
              </button>
              <button className="btn btn-outline" onClick={() => scrollToSection("contact")}>
                Book a Transfer
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-value">35+</span>
                <span className="stat-label">Years of service</span>
              </div>
              <div className="hero-stat">
                <span className="stat-value">90%+</span>
                <span className="stat-label">Top hotels partnered</span>
              </div>
              <div className="hero-stat">
                <span className="stat-value">24/7</span>
                <span className="stat-label">Operations &amp; dispatch</span>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section about slim">
          <div className="container section-inner center">
            <p className="eyebrow">About Us</p>
            <h2>Quietly Moving Cape Town’s Guests Since 1989</h2>
            <p className="section-intro max-720">
              Premium “people mover” brand trusted by Cape Town’s leading hotels and guest houses. From the Mount Nelson
              Travel Desk to bespoke private tours, we deliver discreet, reliable, and efficient transport solutions.
            </p>
            <div className="pill-row">
              <span className="chip">Custom e-hailing app + Taxicaller</span>
              <span className="chip">Exclusive hotel agreements</span>
              <span className="chip">Live-tracked fleet</span>
            </div>
          </div>
        </section>

        <section className="promo-banner" aria-label="Holiday Promotions">
          <div className="container promo-inner">
            <div className="promo-copy">
              <span className="promo-pill">Holiday Offer</span>
              <h2>Seasonal Savings on Signature Private Tours</h2>
              <p>
                Book select full-day private tours for the festive season and enjoy <strong>complimentary airport
                transfers</strong> or an <strong>extended scenic stop</strong> on us.
              </p>
            </div>
            <div className="promo-meta">
              <p>Limited availability • Fully customisable itineraries • Ideal for families &amp; small groups</p>
              <button className="btn btn-light" onClick={() => scrollToSection("tours")}>
                View Eligible Tours
              </button>
            </div>
          </div>
        </section>

        <section id="tours" className="section tours">
          <div className="container section-inner">
            <header className="section-header center">
              <p className="eyebrow">Signature Experiences</p>
              <h2>Curated Private Tours</h2>
              <p className="section-intro max-720">
                Scenic drives, iconic landmarks, and bespoke itineraries designed for families, couples, and corporate
                travellers.
              </p>
            </header>
            <div className="cards-grid" aria-live="polite">
              {tours.map((tour) => (
                <article className="card tour-card soft" key={tour.id}>
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">{tour.name}</h3>
                      <p className="tour-duration">{tour.duration}</p>
                    </div>
                    {tour.promotion ? (
                      <span className="badge badge-gold" aria-label="Holiday promotion">
                        {tour.promotion}
                      </span>
                    ) : null}
                  </div>
                  <p className="card-meta">{tour.description}</p>
                  <ul className="tour-highlights">
                    {tour.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="card-footer">
                    <div>
                      <div className="tour-price">{tour.priceFrom}</div>
                      <div className="rating">
                        <span className="stars" aria-hidden="true">
                          {formatStars(tour.rating)}
                        </span>
                        <span>Rated {tour.rating.toFixed(1)}/5</span>
                      </div>
                    </div>
                    <button className="btn btn-outline" onClick={() => handleTourDetails(tour)}>
                      View Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="vehicles" className="section vehicles">
          <div className="container section-inner">
            <header className="section-header center">
              <p className="eyebrow">Our Fleet</p>
              <h2>Luxury Vehicles for Every Journey</h2>
            </header>
            <div className="cards-grid vehicles-grid" aria-live="polite">
              {vehicles.map((vehicle) => (
                <article className="card soft" key={vehicle.name}>
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">{vehicle.name}</h3>
                      <p className="card-meta">{vehicle.tag}</p>
                    </div>
                    <span className="badge badge-teal">Fleet</span>
                  </div>
                  <div className="card-body">
                    <div className="vehicle-capacity">
                      <span className="chip">Capacity: {vehicle.capacity}</span>
                      <span className="chip">Luggage: {vehicle.luggage}</span>
                    </div>
                    <ul className="vehicle-features">
                      {vehicle.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="drivers" className="section drivers">
          <div className="container section-inner">
            <header className="section-header center">
              <p className="eyebrow">Our Drivers</p>
              <h2>Professional. Discreet. Local Experts.</h2>
            </header>
            <div className="cards-grid drivers-grid" aria-live="polite">
              {drivers.map((driver) => {
                const initials = driver.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <article className="card soft" key={driver.name}>
                    <div className="driver-card">
                      <div className="driver-avatar" aria-hidden="true">
                        {initials}
                      </div>
                      <div>
                        <h3 className="card-title">{driver.name}</h3>
                        <div className="driver-meta">
                          <div>
                            <strong>{driver.experience}</strong>
                          </div>
                          <div className="driver-languages">
                            <strong>Languages:</strong> {driver.languages.join(", ")}
                          </div>
                          <div className="driver-skills">
                            <strong>Focus:</strong> {driver.skills.join(" · ")}
                          </div>
                        </div>
                        <div className="rating">
                          <span className="stars" aria-hidden="true">
                            {formatStars(driver.rating)}
                          </span>
                          <span>Rated {driver.rating.toFixed(1)}/5</span>
                        </div>
                      </div>
                    </div>
                    <div className="driver-quote">{driver.quote}</div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="reviews" className="section reviews">
          <div className="container section-inner">
            <header className="section-header center">
              <p className="eyebrow">Guest Stories</p>
              <h2>Trusted by Travellers</h2>
            </header>
            <div className="cards-grid reviews-grid" aria-live="polite">
              {reviews.map((review, idx) => (
                <article className="card soft" key={`${review.tourId}-${idx}`}>
                  <div className="card-header">
                    <div>
                      <p className="review-tour">{review.tourName}</p>
                      <h3 className="card-title">{review.name}</h3>
                    </div>
                    <span className="chip">
                      <span className="stars" aria-hidden="true">
                        {formatStars(review.rating)}
                      </span>
                      <span>{review.rating.toFixed(1)}/5</span>
                    </span>
                  </div>
                  <p className="review-body">{review.text}</p>
                  <div className="review-footer">
                    <span>Private tour guest</span>
                    <span>Verified Cape Elite traveller</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="membership" className="section membership">
          <div className="container section-inner">
            <header className="section-header center">
              <p className="eyebrow">Membership</p>
              <h2>Preferred Traveller Plans</h2>
            </header>
            <div className="cards-grid membership-grid" aria-live="polite">
              {membershipPlans.map((plan) => (
                <article className={`plan card soft${plan.popular ? " popular" : ""}`} key={plan.id}>
                  <div className="plan-label">
                    <span className={plan.popular ? "badge badge-gold" : "badge badge-teal"}>{plan.tagline}</span>
                  </div>
                  <h3 className="plan-title">{plan.name}</h3>
                  <p className="plan-price">
                    {plan.price} <span>excl. VAT, subject to agreement</span>
                  </p>
                  <ul className="plan-benefits">
                    {plan.benefits.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <button
                    className="btn btn-outline full-width"
                    onClick={() =>
                      alert(
                        `You selected the ${plan.name} plan.\n\n${plan.price}\n\nA Cape Elite representative will contact you to finalise membership details.`
                      )
                    }
                  >
                    Choose Plan
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section contact">
          <div className="container section-inner contact-inner">
            <header className="section-header">
              <p className="eyebrow">Contact</p>
              <h2>Request a Quote or Bespoke Itinerary</h2>
              <p className="section-intro">
                Share your travel dates, group size, and preferences. Our team will respond with a tailored proposal and
                clear, transparent pricing.
              </p>
            </header>

            <div className="contact-grid">
              <form id="contact-form" className="contact-form" noValidate onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="name">
                      Name<span aria-hidden="true">*</span>
                    </label>
                    <input type="text" id="name" name="name" autoComplete="name" />
                    <p className="field-error">{errors.name}</p>
                  </div>
                  <div className="form-field">
                    <label htmlFor="email">
                      Email<span aria-hidden="true">*</span>
                    </label>
                    <input type="email" id="email" name="email" autoComplete="email" />
                    <p className="field-error">{errors.email}</p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="phone">
                      Phone<span aria-hidden="true">*</span>
                    </label>
                    <input type="tel" id="phone" name="phone" autoComplete="tel" />
                    <p className="field-error">{errors.phone}</p>
                  </div>
                  <div className="form-field">
                    <label htmlFor="date">
                      Pickup / Tour Date<span aria-hidden="true">*</span>
                    </label>
                    <input type="date" id="date" name="date" />
                    <p className="field-error">{errors.date}</p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="pickup">
                      Pickup Location<span aria-hidden="true">*</span>
                    </label>
                    <input type="text" id="pickup" name="pickup" />
                    <p className="field-error">{errors.pickup}</p>
                  </div>
                  <div className="form-field">
                    <label htmlFor="dropoff">
                      Drop-off / Tour Selection<span aria-hidden="true">*</span>
                    </label>
                    <select id="dropoff" name="dropoff" defaultValue="">
                      <option value="">Select a tour or transfer option</option>
                      <option value="airport-transfer">Airport Transfer Only</option>
                      <option value="point-to-point">Point-to-Point Transfer</option>
                      {tours.map((tour) => (
                        <option value={tour.id} key={tour.id}>
                          {tour.name}
                        </option>
                      ))}
                    </select>
                    <p className="field-error">{errors.dropoff}</p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="guests">
                      Number of Guests<span aria-hidden="true">*</span>
                    </label>
                    <input type="number" id="guests" name="guests" min="1" max="50" />
                    <p className="field-error">{errors.guests}</p>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="message">Message / Special Requests</label>
                  <textarea id="message" name="message" rows="4"></textarea>
                </div>

                <button type="submit" className="btn btn-primary full-width" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
                <p id="form-success" className="form-success" role="status" aria-live="polite">
                  {successMsg}
                </p>
              </form>

              <aside className="contact-aside">
                <div className="contact-card">
                  <h3>Concierge &amp; Trade Enquiries</h3>
                  <p>
                    For hotel concierge, DMCs, and corporate travel planners, our dedicated trade desk offers contracted
                    rates, priority allocation, and consolidated billing.
                  </p>
                  <ul className="contact-list">
                    <li>
                      <strong>Coverage:</strong> Cape Town, Winelands, West Coast, Garden Route &amp; surrounds
                    </li>
                    <li>
                      <strong>Services:</strong> Point-to-point transfers, touring, roadshows, multi-day programmes
                    </li>
                    <li>
                      <strong>Support:</strong> 24/7 operations &amp; live dispatch
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>
            &copy; <span>{year}</span> Cape Elite Transfers &amp; Tours. All rights reserved.
          </p>
          <p className="footer-meta">Premium private transfers &amp; tours in Cape Town and the Western Cape.</p>
        </div>
      </footer>
    </>
  );
}

export default App;

