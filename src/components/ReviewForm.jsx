import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ReviewForm({ type, targetId, targetName, onReviewSubmit }) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Please enter your name";
    }
    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }
    if (!reviewText.trim()) {
      newErrors.reviewText = "Please write a review";
    }
    if (reviewText.trim().length < 10) {
      newErrors.reviewText = "Review must be at least 10 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    const review = {
      id: Date.now().toString(),
      type, // 'driver' or 'tour'
      targetId, // driver name or tour id
      targetName,
      name: name.trim(),
      rating,
      text: reviewText.trim(),
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    try {
      // Send review to server to email info@unicabtravel.co.za
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review)
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      // Get existing reviews from localStorage
      const existingReviews = JSON.parse(localStorage.getItem("unicab_reviews") || "[]");
      const updatedReviews = [...existingReviews, review];
      localStorage.setItem("unicab_reviews", JSON.stringify(updatedReviews));

      // Call the callback to update the parent component
      if (onReviewSubmit) {
        onReviewSubmit(review);
      }

      // Navigate to thank you page
      navigate("/review/thank-you", {
        state: { review }
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      setErrors({ submit: "Failed to submit review. Please try again." });
      setSubmitting(false);
    }
  };

  return (
    <div className="review-form-container" style={{ marginTop: "2rem", padding: "2rem", background: "var(--bg-soft)", borderRadius: "12px", border: "1px solid var(--border-soft)" }}>
      <h3 style={{ marginBottom: "1.5rem", fontSize: "1.3rem", color: "var(--text-main)" }}>
        Share Your Experience
      </h3>
      
      {errors.submit && (
        <div style={{ 
          padding: "1rem", 
          marginBottom: "1rem", 
          background: "#e74c3c", 
          color: "white", 
          borderRadius: "8px",
          fontSize: "0.9rem"
        }}>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="review-name" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-main)" }}>
            Your Name *
          </label>
          <input
            type="text"
            id="review-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: `1px solid ${errors.name ? "#e74c3c" : "var(--border-soft)"}`,
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontFamily: "inherit"
            }}
          />
          {errors.name && <p style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.name}</p>}
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-main)" }}>
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
          {errors.rating && <p style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.rating}</p>}
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="review-text" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-main)" }}>
            Your Review *
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience..."
            rows="5"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: `1px solid ${errors.reviewText ? "#e74c3c" : "var(--border-soft)"}`,
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
          {errors.reviewText && <p style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.reviewText}</p>}
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

export default ReviewForm;

