import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../lib/api';
import BackToTop from '../components/BackToTop';
import PasswordInput from '../components/PasswordInput';

function MemberLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: loginError } = await login(email, password);

      if (loginError) {
        // Handle different error formats
        const errorMessage = loginError.message || loginError.error || loginError.details || 'Failed to sign in';
        setError(errorMessage);
        
        // If it's a network error, provide more helpful message
        if (errorMessage.includes('Network error') || errorMessage.includes('Could not connect')) {
          setError('Cannot connect to server. Please make sure the backend server is running on port 3000.');
        }
      } else if (data && data.token) {
        // Store token
        localStorage.setItem('auth_token', data.token);
        
        // Redirect based on role
        const role = data.user?.role;
        if (role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else if (role === 'DRIVER') {
          navigate('/driver/dashboard', { replace: true });
        } else if (role === 'MEMBER') {
          navigate('/member/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
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
                <h1 style={{ marginTop: 0, marginBottom: "1rem" }}>Member Login</h1>
                <p style={{ color: "var(--text-soft)", marginBottom: "2rem" }}>
                  Sign in to view your bookings and manage your account
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
                    <PasswordInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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

                <div style={{ 
                  textAlign: "center", 
                  paddingTop: "1.5rem",
                  borderTop: "1px solid var(--border-soft)"
                }}>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-soft)", marginBottom: "1rem" }}>
                    Don't have an account?
                  </p>
                  <Link 
                    to="/member/register" 
                    className="btn btn-outline"
                    style={{ 
                      textDecoration: "none",
                      display: "inline-block"
                    }}
                  >
                    Create Account
                  </Link>
                </div>

                <p style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-soft)", marginTop: "1.5rem" }}>
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

export default MemberLogin;
