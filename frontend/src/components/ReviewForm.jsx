import React, { useState } from "react";
import "./ReviewForm.css";

const ReviewForm = ({ productId, onSubmit, onCancel }) => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(productId, { text: reviewText, rating });
    setReviewText("");
    setRating(5);
  };

  return (
    <div className="review-form-container">
      <form onSubmit={handleSubmit} className="review-form">
        <h3>Leave a Review</h3>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your review..."
          required
        />
        <div className="rating-input">
          <label>Rating:</label>
          <select
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>{r} Star{r > 1 && "s"}</option>
            ))}
          </select>
        </div>
        <div className="review-buttons">
          <button type="submit">Submit</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
