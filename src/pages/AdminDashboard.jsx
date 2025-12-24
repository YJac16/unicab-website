import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBookings, getTours, getDrivers, updateBooking } from '../lib/api';
import BackToTop from '../components/BackToTop';

function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, toursData, driversData] = await Promise.all([
        getBookings(filters),
        getTours(),
        getDrivers(),
      ]);

      if (bookingsData.data) setBookings(bookingsData.data);
      if (toursData.data) setTours(toursData.data);
      if (driversData.data) setDrivers(driversData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const { error } = await updateBooking(bookingId, { status: newStatus });
    if (!error) {
      loadData();
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <p>Loading...</p>
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
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: 'white' }}>Admin: {user?.email}</span>
            <button
              onClick={() => signOut()}
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="section" style={{ paddingTop: "8rem", paddingBottom: "4rem" }}>
          <div className="container">
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
              <h1 style={{ marginBottom: "2rem" }}>Admin Dashboard</h1>

              {/* Stats */}
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem"
              }}>
                <div style={{ 
                  background: "white", 
                  padding: "1.5rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-soft)" }}>Total Bookings</p>
                  <p style={{ margin: "0.5rem 0 0", fontSize: "2rem", fontWeight: "700", color: "var(--accent-gold)" }}>
                    {stats.total}
                  </p>
                </div>
                <div style={{ 
                  background: "white", 
                  padding: "1.5rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-soft)" }}>Pending</p>
                  <p style={{ margin: "0.5rem 0 0", fontSize: "2rem", fontWeight: "700", color: "#856404" }}>
                    {stats.pending}
                  </p>
                </div>
                <div style={{ 
                  background: "white", 
                  padding: "1.5rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-soft)" }}>Confirmed</p>
                  <p style={{ margin: "0.5rem 0 0", fontSize: "2rem", fontWeight: "700", color: "#155724" }}>
                    {stats.confirmed}
                  </p>
                </div>
                <div style={{ 
                  background: "white", 
                  padding: "1.5rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-soft)" }}>Completed</p>
                  <p style={{ margin: "0.5rem 0 0", fontSize: "2rem", fontWeight: "700", color: "#0c5460" }}>
                    {stats.completed}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ 
                display: "flex", 
                gap: "0.5rem", 
                marginBottom: "2rem",
                borderBottom: "2px solid var(--border-soft)"
              }}>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="btn"
                  style={{
                    border: "none",
                    borderRadius: "0",
                    borderBottom: activeTab === 'bookings' ? "2px solid var(--accent-gold)" : "2px solid transparent",
                    marginBottom: "-2px"
                  }}
                >
                  Bookings
                </button>
                <button
                  onClick={() => setActiveTab('tours')}
                  className="btn"
                  style={{
                    border: "none",
                    borderRadius: "0",
                    borderBottom: activeTab === 'tours' ? "2px solid var(--accent-gold)" : "2px solid transparent",
                    marginBottom: "-2px"
                  }}
                >
                  Tours
                </button>
                <button
                  onClick={() => setActiveTab('drivers')}
                  className="btn"
                  style={{
                    border: "none",
                    borderRadius: "0",
                    borderBottom: activeTab === 'drivers' ? "2px solid var(--accent-gold)" : "2px solid transparent",
                    marginBottom: "-2px"
                  }}
                >
                  Drivers
                </button>
              </div>

              {/* Filters */}
              {activeTab === 'bookings' && (
                <div style={{ 
                  background: "white", 
                  padding: "1.5rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)",
                  marginBottom: "2rem"
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem" }}>Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid var(--border-soft)",
                          borderRadius: "8px"
                        }}
                      >
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem" }}>From Date</label>
                      <input
                        type="date"
                        value={filters.date_from}
                        onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid var(--border-soft)",
                          borderRadius: "8px"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem" }}>To Date</label>
                      <input
                        type="date"
                        value={filters.date_to}
                        onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid var(--border-soft)",
                          borderRadius: "8px"
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div style={{ 
                  background: "white", 
                  padding: "2rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>All Bookings</h2>
                  {bookings.length > 0 ? (
                    <div className="cards-grid">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="card soft">
                          <div className="card-header">
                            <h3 className="card-title">
                              {booking.tours?.name || 'Tour'}
                            </h3>
                            <p className="card-meta">
                              {new Date(booking.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </p>
                          </div>
                          <div className="card-body">
                            <p><strong>Driver:</strong> {booking.drivers?.name || 'N/A'}</p>
                            <p><strong>Group Size:</strong> {booking.group_size}</p>
                            <p><strong>Customer:</strong> {booking.customer_name}</p>
                            <p><strong>Email:</strong> {booking.customer_email}</p>
                            <p><strong>Total:</strong> R{parseFloat(booking.total_price).toLocaleString()}</p>
                            <p><strong>Status:</strong> <span style={{
                              padding: "0.25rem 0.5rem",
                              borderRadius: "4px",
                              background: 
                                booking.status === 'confirmed' ? '#d4edda' :
                                booking.status === 'completed' ? '#cce5ff' :
                                booking.status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                              color: 
                                booking.status === 'confirmed' ? '#155724' :
                                booking.status === 'completed' ? '#004085' :
                                booking.status === 'cancelled' ? '#721c24' : '#856404'
                            }}>{booking.status}</span></p>
                          </div>
                          <div className="card-footer">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                  className="btn btn-primary"
                                  style={{ marginRight: "0.5rem" }}
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                  className="btn btn-outline"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                                className="btn btn-primary"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-soft)" }}>No bookings found</p>
                  )}
                </div>
              )}

              {/* Tours Tab */}
              {activeTab === 'tours' && (
                <div style={{ 
                  background: "white", 
                  padding: "2rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Tours</h2>
                  <p style={{ color: "var(--text-soft)", marginBottom: "1rem" }}>
                    Tour management coming soon. For now, manage tours directly in Supabase.
                  </p>
                  <div className="cards-grid">
                    {tours.map((tour) => (
                      <div key={tour.id} className="card soft">
                        <h3 className="card-title">{tour.name}</h3>
                        <p className="card-meta">{tour.duration}</p>
                        <p className="card-meta">Active: {tour.active ? 'Yes' : 'No'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drivers Tab */}
              {activeTab === 'drivers' && (
                <div style={{ 
                  background: "white", 
                  padding: "2rem", 
                  borderRadius: "12px",
                  border: "1px solid var(--border-soft)"
                }}>
                  <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Drivers</h2>
                  <p style={{ color: "var(--text-soft)", marginBottom: "1rem" }}>
                    Driver management coming soon. For now, manage drivers directly in Supabase.
                  </p>
                  <div className="cards-grid">
                    {drivers.map((driver) => (
                      <div key={driver.id} className="card soft">
                        <h3 className="card-title">{driver.name}</h3>
                        <p className="card-meta">{driver.experience}</p>
                        <p className="card-meta">Active: {driver.active ? 'Yes' : 'No'}</p>
                        {driver.vehicles && (
                          <p className="card-meta">Vehicle: {driver.vehicles.type} ({driver.vehicles.capacity} pax)</p>
                        )}
                      </div>
                    ))}
                  </div>
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

export default AdminDashboard;



