import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import BackToTop from "../components/BackToTop";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const bookingRef = searchParams.get('bookingRef');

  return (
    <div>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo" aria-label="UNICAB Travel & Tours - Home">
            <img src="/logo-white.png" alt="UNICAB Travel & Tours" className="logo-img" />
          </Link>
        </div>
      </header>

      <main>
        <section className="section" style={{ paddingTop: "8rem", paddingBottom: "4rem", minHeight: "70vh" }}>
          <div className="container">
            <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
              <div style={{
                fontSize: "4rem",
                color: "var(--accent-teal)",
                marginBottom: "1.5rem"
              }}>
                ✓
              </div>
              
              <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Payment Successful!</h1>
              
              <p style={{ fontSize: "1.1rem", color: "var(--text-soft)", marginBottom: "2rem" }}>
                Your payment has been processed successfully. Your booking is now confirmed.
              </p>

              {bookingRef && (
                <div style={{
                  background: "var(--bg-soft)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)",
                  marginBottom: "2rem"
                }}>
                  <p style={{ margin: 0, color: "var(--text-soft)", fontSize: "0.9rem" }}>
                    <strong>Booking Reference:</strong> {bookingRef}
                  </p>
                </div>
              )}

              <div style={{
                background: "#d1ecf1",
                border: "1px solid #0c5460",
                borderRadius: "8px",
                padding: "1.5rem",
                marginBottom: "2rem",
                textAlign: "left"
              }}>
                <p style={{ margin: 0, color: "#0c5460", fontSize: "0.95rem" }}>
                  <strong>What's Next?</strong>
                </p>
                <ul style={{ margin: "0.75rem 0 0 0", paddingLeft: "1.5rem", color: "#0c5460" }}>
                  <li>You will receive a confirmation email with your booking details</li>
                  <li>Our team will contact you via WhatsApp or email to finalize arrangements</li>
                  <li>If you have any questions, please don't hesitate to reach out</li>
                </ul>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/tours" className="btn btn-primary" style={{ textDecoration: "none" }}>
                  Browse More Tours
                </Link>
                <Link to="/" className="btn btn-outline" style={{ textDecoration: "none" }}>
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BackToTop />
    </div>
  );
}

export default PaymentSuccess;

