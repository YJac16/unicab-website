import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const [jwtUser, setJwtUser] = useState(null);
  const [jwtLoading, setJwtLoading] = useState(true);

  // Check for JWT token
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // Decode JWT to get user info (without verification - just for UI)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setJwtUser({
          role: payload.role,
          email: payload.email,
          driverId: payload.driverId
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('auth_token');
      }
    }
    setJwtLoading(false);
  }, []);

  // Use JWT auth if token exists, otherwise fall back to Supabase auth
  const isAuth = jwtUser || isAuthenticated;
  const role = jwtUser?.role?.toLowerCase() || userRole;
  const isLoading = jwtLoading || loading;

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const normalizedRequired = requiredRole.toLowerCase();
    const normalizedUserRole = role?.toLowerCase();
    
    if (normalizedUserRole !== normalizedRequired && normalizedUserRole !== normalizedRequired.toUpperCase()) {
      // Redirect based on role
      if (normalizedUserRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (normalizedUserRole === 'driver') {
        return <Navigate to="/driver/dashboard" replace />;
      } else if (normalizedUserRole === 'member') {
        return <Navigate to="/member/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};



