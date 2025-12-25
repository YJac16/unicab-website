import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    
    // Check for auth token and decode user info
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // Validate token format (should have 3 parts separated by dots)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          // Validate payload has required fields
          if (payload && (payload.email || payload.name || payload.role)) {
            setUser({
              name: payload.name || payload.email?.split('@')[0] || 'User',
              email: payload.email,
              role: payload.role
            });
          } else {
            // Invalid token payload, remove it
            localStorage.removeItem('auth_token');
            setUser(null);
          }
        } else {
          // Invalid token format, remove it
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } else {
      // No token, ensure user is null
      setUser(null);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Don't render until mounted (prevents hydration issues)
  // But show Sign In button immediately to avoid flicker
  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        position: 'relative',
        zIndex: 100,
        visibility: 'visible',
        opacity: 1
      }}>
        <Link
          to="/login"
          className="btn btn-outline"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            textDecoration: 'none',
            display: 'inline-block',
            whiteSpace: 'nowrap',
            visibility: 'visible',
            opacity: 1,
            position: 'relative',
            zIndex: 100
          }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsOpen(false);
    navigate('/');
    window.location.reload(); // Refresh to update UI
  };

  const getDashboardPath = () => {
    if (!user) return null;
    const role = user.role?.toLowerCase();
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'driver') return '/driver/dashboard';
    if (role === 'member') return '/member/dashboard';
    return null;
  };

  if (!user) {
    // Not logged in - show Sign In button
    // Always render this, even if there are errors
    return (
      <div 
        className="profile-dropdown-container"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          position: 'relative',
          zIndex: 100,
          visibility: 'visible',
          opacity: 1,
          minWidth: 'fit-content'
        }}
      >
        <Link
          to="/login"
          className="btn btn-outline"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            textDecoration: 'none',
            display: 'inline-block !important',
            whiteSpace: 'nowrap',
            visibility: 'visible !important',
            opacity: '1 !important',
            position: 'relative',
            zIndex: 100,
            minWidth: '80px',
            textAlign: 'center'
          }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Logged in - show profile dropdown
  const dashboardPath = getDashboardPath();

  return (
    <div ref={dropdownRef} style={{ position: 'relative', zIndex: 100 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'transparent',
          border: '1px solid var(--border-soft)',
          borderRadius: '999px',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontSize: '0.85rem',
          color: 'var(--text-main)',
          transition: 'all var(--transition-fast)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-gold)';
          e.currentTarget.style.color = 'var(--accent-gold)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-soft)';
          e.currentTarget.style.color = 'var(--text-main)';
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>{user.name}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast)'
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            background: 'white',
            border: '1px solid var(--border-soft)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            minWidth: '200px',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid var(--border-soft)',
              background: 'var(--bg-soft)'
            }}
          >
            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginTop: '0.25rem' }}>
              {user.email}
            </div>
            {user.role && (
              <div
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  background: 'var(--accent-gold)',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}
              >
                {user.role}
              </div>
            )}
          </div>

          <div style={{ padding: '0.5rem' }}>
            {dashboardPath && (
              <Link
                to={dashboardPath}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-soft)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                  </svg>
                  Dashboard
                </div>
              </Link>
            )}

            <Link
              to={user.role === 'ADMIN' ? '/admin/profile' : user.role === 'DRIVER' ? '/driver/profile' : '/member/profile'}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                textDecoration: 'none',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                borderRadius: '8px',
                transition: 'background var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-soft)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile
              </div>
            </Link>

            <Link
              to="/payments"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                textDecoration: 'none',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                borderRadius: '8px',
                transition: 'background var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-soft)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Payments
              </div>
            </Link>

            <Link
              to="/subscriptions"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                textDecoration: 'none',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                borderRadius: '8px',
                transition: 'background var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-soft)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Subscriptions
              </div>
            </Link>

            <div
              style={{
                height: '1px',
                background: 'var(--border-soft)',
                margin: '0.5rem 0'
              }}
            />

            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: 'none',
                color: '#e74c3c',
                fontSize: '0.9rem',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'background var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;

