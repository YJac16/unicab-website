import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BackToTop from '../components/BackToTop';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'driver') {
        navigate('/driver/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message || 'Failed to sign in');
    } else {
      // Navigation handled by useEffect
    }

    setLoading(false);
  };

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
            <div style={{ maxWidth: "500px", margin: "0 auto" }}>
              <div style={{ 
                background: "white", 
                padding: "2rem", 
                borderRadius: "12px",
                border: "1px solid var(--border-soft)",
                boxShadow: "var(--shadow-soft)"
              }}>
                <h1 style={{ marginTop: 0, marginBottom: "1rem" }}>Sign In</h1>
                <p style={{ color: "var(--text-soft)", marginBottom: "2rem" }}>
                  Access your driver dashboard or admin panel
                </p>

                {error && (
                  <div style={{
                    padding: "1rem",
                    background: "#fee",
                    border: "1px solid #fcc",
                    borderRadius: "8px",
                    marginBottom: "1.5rem",
                    color: "#c33"
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "0.5rem", 
                      fontSize: "0.9rem", 
                      fontWeight: "500" 
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "0.5rem", 
                      fontSize: "0.9rem", 
                      fontWeight: "500" 
                    }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ 
                      width: "100%", 
                      fontSize: "1rem", 
                      padding: "1rem",
                      marginBottom: "1rem"
                    }}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <p style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-soft)" }}>
                  <Link to="/" style={{ color: "var(--accent-gold)" }}>
                    ← Back to Home
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BackToTop />
    </div>
  );
}

export default Login;

