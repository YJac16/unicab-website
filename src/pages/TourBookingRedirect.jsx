import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * TourBookingRedirect - Redirects to SimplyBook.me booking
 * Custom booking flow disabled - SimplyBook.me is the source of truth
 */
function TourBookingRedirect() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to SimplyBook booking page
    // SimplyBook.me handles all booking logic, availability, and pricing
    navigate('/book', { replace: true });
  }, [id, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '50vh',
      textAlign: 'center'
    }}>
      <p>Redirecting to booking...</p>
    </div>
  );
}

export default TourBookingRedirect;

