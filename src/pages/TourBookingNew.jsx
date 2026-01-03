import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getTour, getAvailableGuides, createBooking, calculateTourPrice } from "../lib/api";
import { tours as localTours } from "../data";
import BackToTop from "../components/BackToTop";

function TourBookingNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Tour, 2: Date, 3: Group Size, 4: Guides, 5: Summary, 6: Payment
  const [tour, setTour] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [groupSize, setGroupSize] = useState(1);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [availableGuides, setAvailableGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTour();
    // Set minimum date to today
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, [id]);

  const loadTour = async () => {
    setLoading(true);
    const { data, error } = await getTour(id);
    if (error || !data) {
      // Fallback to local data
      const localTour = localTours.find((t) => t.id === id);
      if (!localTour) {
        navigate("/tours");
        return;
      }
      setTour(localTour);
    } else {
      setTour(data);
    }
    setLoading(false);
  };

  // Load available guides when date is selected
  useEffect(() => {
    if (step >= 4 && selectedDate) {
      loadAvailableGuides();
    }
  }, [selectedDate, step]);

  const loadAvailableGuides = async () => {
    const { data, error } = await getAvailableGuides(selectedDate);
    if (error) {
      console.error('Error loading guides:', error);
      setAvailableGuides([]);
    } else {
      setAvailableGuides(data || []);
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep >= 2 && !selectedDate) {
      newErrors.date = "Please select a date";
    } else if (currentStep >= 2 && selectedDate) {
      const selected = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.date = "Date cannot be in the past";
      }
    }

    if (currentStep >= 3 && (!groupSize || groupSize < 1)) {
      newErrors.groupSize = "Group size must be at least 1";
    } else if (currentStep >= 3 && tour?.max_people && groupSize > tour.max_people) {
      newErrors.groupSize = `Group size cannot exceed ${tour.max_people} people`;
    }

    if (currentStep >= 4 && !selectedGuide) {
      newErrors.guide = "Please select a guide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSelectGuide = (guide) => {
    setSelectedGuide(guide);
    setErrors({ ...errors, guide: null });
  };

  const handleSubmitBooking = async () => {
    if (!validateStep(5)) {
      return;
    }

    setSubmitting(true);

    try {
      // Check if user is logged in as member
      const token = localStorage.getItem('auth_token');
      let userId = null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.role === 'MEMBER') {
            userId = payload.userId;
          }
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }

      const bookingData = {
        tour_id: tour.id,
        guide_id: selectedGuide.id || selectedGuide.guide_id,
        date: selectedDate,
        group_size: groupSize,
        customer_name: "Guest User", // Will be collected in checkout
        customer_email: "guest@example.com", // Will be collected in checkout
        user_id: userId, // Link to member account if logged in
      };

      const { data, error } = await createBooking(bookingData);

      if (error) {
        alert(`Failed to create booking: ${error.message || 'Unknown error'}`);
        setSubmitting(false);
        return;
      }

      // Navigate to checkout/summary page
      navigate(`/tours/${id}/checkout`, {
        state: {
          booking: data,
          tour,
          guide: selectedGuide,
          date: selectedDate,
          groupSize,
          pricePerPerson: calculateTourPrice(tour, groupSize),
          totalPrice: calculateTourPrice(tour, groupSize) * groupSize,
        }
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !tour) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  const pricePerPerson = calculateTourPrice(tour, groupSize);
  const totalPrice = pricePerPerson * groupSize;

  return (
    <div>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo" aria-label="UNICAB Travel & Tours - Home">
            <img src="/logo-white.png" alt="UNICAB Travel & Tours" className="logo-img" />
          </Link>

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
              <li>
                <Link className="link-button" to="/" onClick={() => setNavOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link className="link-button" to="/tours" onClick={() => setNavOpen(false)}>
                  Tours
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section className="section" style={{ paddingTop: "8rem", paddingBottom: "4rem" }}>
          <div className="container">
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
              <Link 
                to={`/tours/${id}`} 
                className="btn btn-outline" 
                style={{ marginBottom: "2rem", textDecoration: "none" }}
              >
                ← Back to Tour Details
              </Link>

              {/* Progress Steps */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                marginBottom: "2rem",
                flexWrap: "wrap",
                gap: "0.5rem"
              }}>
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div
                    key={s}
                    style={{
                      flex: "1",
                      minWidth: "80px",
                      textAlign: "center",
                      padding: "0.5rem",
                      background: step >= s ? "var(--accent-gold)" : "var(--bg-soft)",
                      color: step >= s ? "white" : "var(--text-soft)",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: step === s ? "600" : "400"
                    }}
                  >
                    Step {s}
                  </div>
                ))}
              </div>

              {/* Step 1: Tour Selection (already selected via route) */}
              {step === 1 && (
                <div style={{ 
                  background: "var(--bg-soft)", 
                  padding: "2rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <h2 style={{ marginTop: 0 }}>Step 1: Select Tour</h2>
                  <div style={{ marginBottom: "1rem" }}>
                    <h3>{tour.name}</h3>
                    <p style={{ color: "var(--text-soft)" }}>{tour.description || tour.duration}</p>
                  </div>
                  <button className="btn btn-primary" onClick={handleNext}>
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Select Date */}
              {step === 2 && (
                <div style={{ 
                  background: "var(--bg-soft)", 
                  padding: "2rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <h2 style={{ marginTop: 0 }}>Step 2: Select Date</h2>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                      Tour Date *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setErrors({ ...errors, date: null });
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: `1px solid ${errors.date ? "#e74c3c" : "var(--border-soft)"}`,
                        borderRadius: "8px",
                        fontSize: "1rem"
                      }}
                    />
                    {errors.date && (
                      <p style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        {errors.date}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button className="btn btn-outline" onClick={handleBack}>
                      Back
                    </button>
                    <button className="btn btn-primary" onClick={handleNext}>
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Select Group Size */}
              {step === 3 && (
                <div style={{ 
                  background: "var(--bg-soft)", 
                  padding: "2rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <h2 style={{ marginTop: 0 }}>Step 3: Select Group Size</h2>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                      Number of People *
                    </label>
                    <input
                      type="number"
                      value={groupSize}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setGroupSize(Math.max(1, Math.min(value, tour?.max_people || 22)));
                        setErrors({ ...errors, groupSize: null });
                      }}
                      min={1}
                      max={tour?.max_people || 22}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: `1px solid ${errors.groupSize ? "#e74c3c" : "var(--border-soft)"}`,
                        borderRadius: "8px",
                        fontSize: "1rem"
                      }}
                    />
                    {errors.groupSize && (
                      <p style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        {errors.groupSize}
                      </p>
                    )}
                    {tour?.max_people && (
                      <p style={{ color: "var(--text-soft)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        Maximum: {tour.max_people} people
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button className="btn btn-outline" onClick={handleBack}>
                      Back
                    </button>
                    <button className="btn btn-primary" onClick={handleNext}>
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Select Guide */}
              {step === 4 && (
                <div style={{ 
                  background: "var(--bg-soft)", 
                  padding: "2rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <h2 style={{ marginTop: 0 }}>Step 4: Select Guide</h2>
                  <p style={{ color: "var(--text-soft)", marginBottom: "1.5rem" }}>
                    Available guides for {new Date(selectedDate).toLocaleDateString("en-US", { 
                      year: "numeric", 
                      month: "long", 
                      day: "numeric" 
                    })}
                  </p>

                  {availableGuides.length === 0 ? (
                    <div style={{ 
                      padding: "2rem", 
                      textAlign: "center", 
                      background: "white",
                      borderRadius: "8px",
                      border: "1px solid var(--border-soft)"
                    }}>
                      <p style={{ color: "var(--text-soft)" }}>
                        No guides available on this date. Please select a different date.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                      {availableGuides.map((guide) => (
                        <div
                          key={guide.id || guide.guide_id}
                          onClick={() => handleSelectGuide(guide)}
                          style={{
                            padding: "1.5rem",
                            background: selectedGuide?.id === guide.id || selectedGuide?.guide_id === guide.guide_id 
                              ? "var(--accent-gold)" 
                              : "white",
                            color: selectedGuide?.id === guide.id || selectedGuide?.guide_id === guide.guide_id 
                              ? "white" 
                              : "inherit",
                            borderRadius: "8px",
                            border: `2px solid ${
                              selectedGuide?.id === guide.id || selectedGuide?.guide_id === guide.guide_id 
                                ? "var(--accent-gold)" 
                                : "var(--border-soft)"
                            }`,
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                        >
                          <h3 style={{ margin: "0 0 0.5rem 0" }}>
                            {guide.name || guide.guide_name}
                          </h3>
                          <p style={{ margin: 0, opacity: 0.9 }}>
                            {guide.email || guide.guide_email}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.guide && (
                    <p style={{ color: "#e74c3c", fontSize: "0.85rem", marginBottom: "1rem" }}>
                      {errors.guide}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button className="btn btn-outline" onClick={handleBack}>
                      Back
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleNext}
                      disabled={!selectedGuide}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Booking Summary */}
              {step === 5 && (
                <div style={{ 
                  background: "var(--bg-soft)", 
                  padding: "2rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <h2 style={{ marginTop: 0 }}>Step 5: Booking Summary</h2>
                  
                  <div style={{ 
                    background: "white", 
                    padding: "1.5rem", 
                    borderRadius: "8px",
                    marginBottom: "1.5rem"
                  }}>
                    <div style={{ display: "grid", gap: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-soft)" }}>Tour:</span>
                        <strong>{tour.name}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-soft)" }}>Date:</span>
                        <strong>{new Date(selectedDate).toLocaleDateString("en-US", { 
                          year: "numeric", 
                          month: "long", 
                          day: "numeric" 
                        })}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-soft)" }}>Group Size:</span>
                        <strong>{groupSize} {groupSize === 1 ? "person" : "people"}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-soft)" }}>Guide:</span>
                        <strong>{selectedGuide?.name || selectedGuide?.guide_name}</strong>
                      </div>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        paddingTop: "1rem",
                        borderTop: "1px solid var(--border-soft)"
                      }}>
                        <span style={{ color: "var(--text-soft)" }}>Price per person:</span>
                        <strong>R{pricePerPerson.toLocaleString()}</strong>
                      </div>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        fontSize: "1.2rem",
                        fontWeight: "700",
                        color: "var(--accent-gold)",
                        paddingTop: "1rem",
                        borderTop: "2px solid var(--border-soft)"
                      }}>
                        <span>Total:</span>
                        <span>R{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button className="btn btn-outline" onClick={handleBack}>
                      Back
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleSubmitBooking}
                      disabled={submitting}
                    >
                      {submitting ? "Creating Booking..." : "Proceed to Payment"}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 6: Payment (Disabled) */}
              {step === 6 && (
                <div style={{ 
                  background: "var(--bg-soft)", 
                  padding: "2rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <h2 style={{ marginTop: 0 }}>Step 6: Payment</h2>
                  <div style={{ 
                    padding: "2rem", 
                    background: "white",
                    borderRadius: "8px",
                    textAlign: "center",
                    marginBottom: "1.5rem"
                  }}>
                    <p style={{ fontSize: "1.1rem", color: "var(--text-soft)", marginBottom: "1rem" }}>
                      Online payments coming soon
                    </p>
                    <button 
                      className="btn btn-primary" 
                      disabled
                      style={{ opacity: 0.5, cursor: "not-allowed" }}
                    >
                      Proceed to Payment (Disabled)
                    </button>
                  </div>
                  <button className="btn btn-outline" onClick={handleBack}>
                    Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <BackToTop />
    </div>
  );
}

export default TourBookingNew;







