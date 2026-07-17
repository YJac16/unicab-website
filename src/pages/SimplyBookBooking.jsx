import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getSimplyBookServices, getSimplyBookAvailability, createSimplyBookBooking } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import BackToTop from "../components/BackToTop";

/**
 * SimplyBook Booking Integration Page
 * Minimal UI that integrates SimplyBook booking flow
 * Preserves existing site styling and UX
 */
function SimplyBookBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Load user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setClientName(user.user_metadata?.full_name || user.email?.split('@')[0] || "");
      setClientEmail(user.email || "");
    }
  }, [isAuthenticated, user]);

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  // Load availability when service and date are selected
  useEffect(() => {
    if (selectedService && selectedDate) {
      loadAvailability();
    } else {
      setAvailability([]);
    }
  }, [selectedService, selectedDate, selectedUnit]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await getSimplyBookServices();
      
      if (error) {
        setError(error.message || 'Failed to load services');
        return;
      }

      setServices(data || []);
      
      // Pre-select service from URL if provided
      const serviceId = searchParams.get('serviceId');
      if (serviceId && data) {
        const service = data.find(s => s.id === serviceId || s.service_id === serviceId);
        if (service) {
          setSelectedService(service.id || service.service_id);
        }
      }
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const serviceId = selectedService;
      const unitId = selectedUnit || null;
      
      const { data, error } = await getSimplyBookAvailability(serviceId, selectedDate, unitId);
      
      if (error) {
        setError(error.message || 'Failed to load availability');
        return;
      }

      setAvailability(data || []);
    } catch (err) {
      console.error('Error loading availability:', err);
      setError('Failed to load availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create booking in SimplyBook
      const bookingData = {
        serviceId: selectedService,
        date: selectedDate,
        time: selectedTime,
        unitId: selectedUnit,
        clientName,
        clientEmail,
        clientPhone: clientPhone || undefined
      };

      const { data: booking, error: bookingError } = await createSimplyBookBooking(bookingData);

      if (bookingError) {
        setError(bookingError.message || 'Failed to create booking');
        setSubmitting(false);
        return;
      }

      // SimplyBook is the single source of truth - no local storage needed

      // Redirect to confirmation page
      navigate('/booking-confirmation', {
        state: {
          bookingId: booking.id,
          bookingRef: booking.booking_ref || booking.id,
          serviceName: services.find(s => (s.id || s.service_id) === selectedService)?.name,
          date: selectedDate,
          time: selectedTime,
          clientName,
          clientEmail
        }
      });
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('An error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  if (loading && services.length === 0) {
    return (
      <div>
        <header className="site-header">
          <div className="container header-inner">
            <Link to="/" className="logo" aria-label="UNICAB Travel & Tours - Home">
              <img src="/logo-white.png" alt="UNICAB Travel & Tours" className="logo-img" />
            </Link>
          </div>
        </header>
        <main style={{ paddingTop: "8rem", textAlign: "center", minHeight: "50vh" }}>
          <div className="container">
            <p>Loading services...</p>
          </div>
        </main>
      </div>
    );
  }

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
        <section className="section" style={{ paddingTop: "8rem", paddingBottom: "4rem" }}>
          <div className="container">
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <h1 style={{ marginBottom: "2rem", textAlign: "center" }}>Book Your Tour</h1>

              {error && (
                <div style={{
                  padding: "1rem",
                  marginBottom: "2rem",
                  background: "#fee",
                  color: "#c33",
                  borderRadius: "8px",
                  border: "1px solid #fcc"
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{
                  background: "white",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)",
                  marginBottom: "2rem"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Select Service</h3>
                  
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label htmlFor="service" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500" }}>
                      Service *
                    </label>
                    <select
                      id="service"
                      value={selectedService || ""}
                      onChange={(e) => setSelectedService(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--border-soft)",
                        borderRadius: "8px",
                        fontSize: "0.9rem"
                      }}
                    >
                      <option value="">Select a service...</option>
                      {services.map((service) => (
                        <option key={service.id || service.service_id} value={service.id || service.service_id}>
                          {service.name} {service.price ? `- R${service.price}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label htmlFor="date" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500" }}>
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={today}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--border-soft)",
                        borderRadius: "8px",
                        fontSize: "0.9rem"
                      }}
                    />
                  </div>

                  {selectedService && selectedDate && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label htmlFor="time" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500" }}>
                        Available Time *
                      </label>
                      {loading ? (
                        <p style={{ color: "var(--text-soft)" }}>Loading availability...</p>
                      ) : availability.length > 0 ? (
                        <select
                          id="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          required
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid var(--border-soft)",
                            borderRadius: "8px",
                            fontSize: "0.9rem"
                          }}
                        >
                          <option value="">Select a time...</option>
                          {availability.map((slot, index) => (
                            <option key={index} value={slot.time || slot.start_time}>
                              {slot.time || slot.start_time} {slot.unit_name ? `- ${slot.unit_name}` : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p style={{ color: "var(--text-soft)" }}>No availability for this date. Please select another date.</p>
                      )}
                    </div>
                  )}
                </div>

                <div style={{
                  background: "white",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)",
                  marginBottom: "2rem"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Contact Information</h3>
                  
                  <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor="clientName" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--border-soft)",
                        borderRadius: "8px",
                        fontSize: "0.9rem"
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor="clientEmail" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500" }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      id="clientEmail"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--border-soft)",
                        borderRadius: "8px",
                        fontSize: "0.9rem"
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="clientPhone" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500" }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--border-soft)",
                        borderRadius: "8px",
                        fontSize: "0.9rem"
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedService || !selectedDate || !selectedTime}
                  className="btn btn-primary"
                  style={{ width: "100%", fontSize: "1.1rem", padding: "1rem" }}
                >
                  {submitting ? "Creating Booking..." : "Confirm Booking"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <BackToTop />
    </div>
  );
}

export default SimplyBookBooking;

