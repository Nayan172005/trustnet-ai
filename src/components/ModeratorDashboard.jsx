import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ModeratorDashboard.css";

const ModeratorDashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [filterReviewer, setFilterReviewer] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [onlyFake, setOnlyFake] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products/moderator/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleDelete = async (productId, reviewId) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}/reviews/${reviewId}`);
      fetchReviews(); // refresh the list
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  const handleEdit = async (productId, reviewId, newClassification) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${productId}/reviews/${reviewId}`, {
        classification: newClassification,
        explanation: "Human Verified.",
      });
      fetchReviews(); // refresh the list
    } catch (err) {
      console.error("Error editing review:", err);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    return (
      (!filterReviewer || review.reviewer.toLowerCase().includes(filterReviewer.toLowerCase())) &&
      (!filterProduct || review.productTitle.toLowerCase().includes(filterProduct.toLowerCase())) &&
      (!onlyFake || review.classification === "Fake")
    );
  });

  return (
    <div className="moderator-dashboard">
      <h2>Moderator Dashboard</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Filter by reviewer"
          value={filterReviewer}
          onChange={(e) => setFilterReviewer(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by product title"
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={onlyFake}
            onChange={(e) => setOnlyFake(e.target.checked)}
          />
          Show only Fake reviews
        </label>
      </div>

      {filteredReviews.map((review, idx) => (
        <div key={idx} className={`review-card ${review.classification === "Fake" ? "fake" : ""}`}>
          <p><strong>Reviewer:</strong> {review.reviewer}</p>
          <p><strong>Product:</strong> {review.productTitle}</p>
          <p><strong>Rating:</strong> {review.rating}⭐</p>
          <p><strong>Comment:</strong> {review.comment}</p>
          <p><strong>Classification:</strong> {review.classification}</p>
          <p><strong>Explanation:</strong> {review.explanation}</p>

          <div className="moderator-actions">
            {review.classification === "Fake" && (
              <button onClick={() => handleDelete(review.productId, review._id)}>
                Delete
              </button>
            )}
            <button
              onClick={() =>
                handleEdit(
                  review.productId,
                  review._id,
                  review.classification === "Fake" ? "Real" : "Fake"
                )
              }
            >
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModeratorDashboard;
