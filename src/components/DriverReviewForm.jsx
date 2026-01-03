import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

function DriverReviewForm({ driverId, bookingId, onReviewSubmit }) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasBooking, setHasBooking] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(true);

  useEffect(() => {
    const checkBooking = async () => {
      if (!isAuthenticated || !user || !driverId) {
        setCheckingBooking(false);
        return;
      }

      try {
        // Check if user has a completed booking for this driver
        const { data, error } = await supabase
          .from('bookings')
          .select('id, status')
          .eq('driver_id', driverId)
          .eq('customer_email', user.email)
          .in('status', ['completed', 'confirmed'])
          .limit(1);

        if (!error && data && data.length > 0) {
          setHasBooking(true);
        }
      } catch (err) {
        console.error('Error checking booking:', err);
      } finally {
        setCheckingBooking(false);
      }
    };

    checkBooking();
  }, [isAuthenticated, user, driverId]);

  const validate = () => {
    const newErrors = {};
    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }
    if (!comment.trim()) {
      newErrors.comment = "Please write a review";
    }
    if (comment.trim().length < 10) {
      newErrors.comment = "Review must be at least 10 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const { data, error } = await supabase
        .from('driver_reviews')
        .insert({
          user_id: user.id,
          driver_id: driverId,
          booking_id: bookingId || null,
          rating,
          comment: comment.trim(),
          approved: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSuccess(true);
      if (onReviewSubmit) {
        onReviewSubmit(data);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setErrors({ submit: "Failed to submit review. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        padding: "2rem", 
        background: "var(--bg-soft)", 
        borderRadius: "12px", 
        border: "1px solid var(--border-soft)",
        textAlign: "center"
      }}>
        <p style={{ marginBottom: "1rem", color: "var(--text-soft)" }}>
          Please <Link to="/login" style={{ color: "var(--accent-gold)" }}>sign in</Link> to leave a review.
        </p>
      </div>
    );
  }

  if (checkingBooking) {
    return (
      <div style={{ 
        padding: "2rem", 
        background: "var(--bg-soft)", 
        borderRadius: "12px", 
        border: "1px solid var(--border-soft)",
        textAlign: "center"
      }}>
        <p style={{ color: "var(--text-soft)" }}>Checking booking status...</p>
      </div>
    );
  }

  if (!hasBooking) {
    return (
      <div style={{ 
        padding: "2rem", 
        background: "var(--bg-soft)", 
        borderRadius: "12px", 
        border: "1px solid var(--border-soft)"
      }}>
        <p style={{ color: "var(--text-soft)", margin: 0 }}>
          You can only review drivers after completing a booking with them.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ 
        padding: "2rem", 
        background: "#d4edda", 
        borderRadius: "12px", 
        border: "1px solid #c3e6cb",
        color: "#155724"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Thank You!</h3>
        <p style={{ margin: 0 }}>
          Your review has been submitted and is pending approval. We appreciate your feedback!
        </p>
      </div>
    );
  }

  return (
    <div className="review-form-container" style={{ 
      marginTop: "2rem", 
      padding: "2rem", 
      background: "var(--bg-soft)", 
      borderRadius: "12px", 
      border: "1px solid var(--border-soft)" 
    }}>
      <h3 style={{ marginBottom: "1.5rem", fontSize: "1.3rem", color: "var(--text-main)" }}>
        Share Your Experience
      </h3>
      
      {errors.submit && (
        <div style={{ 
          padding: "1rem", 
          marginBottom: "1rem", 
          background: "#fee", 
          color: "#c33", 
          borderRadius: "8px",
          fontSize: "0.9rem"
        }}>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            fontSize: "0.9rem", 
            fontWeight: "500", 
            color: "var(--text-main)" 
          }}>
            Rating *
          </label>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "2rem",
                  padding: "0",
                  lineHeight: "1",
                  color: star <= (hoverRating || rating) ? "var(--accent-gold)" : "#ddd",
                  transition: "color 0.2s"
                }}
                aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
            <span style={{ marginLeft: "0.5rem", fontSize: "0.9rem", color: "var(--text-soft)" }}>
              {rating > 0 && `${rating}/5`}
            </span>
          </div>
          {errors.rating && (
            <p style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              {errors.rating}
            </p>
          )}
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="review-comment" style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            fontSize: "0.9rem", 
            fontWeight: "500", 
            color: "var(--text-main)" 
          }}>
            Your Review *
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this driver..."
            rows="5"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: `1px solid ${errors.comment ? "#e74c3c" : "var(--border-soft)"}`,
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
          {errors.comment && (
            <p style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              {errors.comment}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary"
          style={{ width: "100%" }}
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}

export default DriverReviewForm;






