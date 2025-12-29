import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirement
  if (requiredRole) {
    const normalizedRequired = requiredRole.toLowerCase();
    const normalizedUserRole = userRole?.toLowerCase();
    
    if (normalizedUserRole !== normalizedRequired) {
      // Redirect based on user's actual role
      if (normalizedUserRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (normalizedUserRole === 'driver') {
        return <Navigate to="/driver/dashboard" replace />;
      } else if (normalizedUserRole === 'member' || normalizedUserRole === 'customer') {
        return <Navigate to="/member/dashboard" replace />;
      }
      // If role doesn't match and no specific redirect, go home
      return <Navigate to="/" replace />;
    }
  }

  return children;
};





