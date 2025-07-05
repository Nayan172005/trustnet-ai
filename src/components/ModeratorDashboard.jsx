import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./ModeratorDashboard.css";

const ModeratorDashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [filterReviewer, setFilterReviewer] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [onlyFake, setOnlyFake] = useState(false);
  const [reviewStats, setReviewStats] = useState({ fake: 0, real: 0 });
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'delete' or 'edit'
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
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

  const fetchReviewStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products/moderator/review-stats");
      setReviewStats(res.data);
    } catch (err) {
      console.error("Error fetching review stats:", err);
    }
  };

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

  <div className="review-stats-container">
    <div className="review-stats-chart">
      <h3>Fake vs Real Review Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={[
              { name: "Fake", value: reviewStats.fake },
              { name: "Real", value: reviewStats.real },
            ]}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            <Cell fill="#FF6B6B" />
            <Cell fill="#4CAF50" />
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} reviews`, name]} 
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #d5d9d9',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span style={{ color: '#0F1111' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>

    <div className="stats-summary">
      <h3>Review Statistics</h3>
      <div className="stat-item">
        <span className="stat-label">Total Reviews:</span>
        <span className="stat-value total">{reviewStats.fake + reviewStats.real}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Authentic Reviews:</span>
        <span className="stat-value real">{reviewStats.real} ({Math.round((reviewStats.real / (reviewStats.fake + reviewStats.real || 1)) * 100)}%)</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Potential Fake Reviews:</span>
        <span className="stat-value fake">{reviewStats.fake} ({Math.round((reviewStats.fake / (reviewStats.fake + reviewStats.real || 1)) * 100)}%)</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Last Updated:</span>
        <span className="stat-value">{new Date().toLocaleString()}</span>
      </div>
    </div>
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
            <button
              onClick={() => {
                setModalAction("delete");
                setSelectedReview(review);
                setShowConfirm(true);
              }}
            >
              Delete
            </button>
            )}
            <button
              onClick={() => {
                setModalAction("edit");
                setSelectedReview(review);
                setShowConfirm(true);
              }}
            >
              Edit
            </button>
          </div>
        </div>
      ))}
    {showConfirm && selectedReview && (
      <div className="modal-backdrop">
        <div className="modal">
          <h3>Are you sure?</h3>
          <p>
            You are about to{" "}
            <strong>{modalAction === "delete" ? "delete" : "edit"} </strong>
            this review:
          </p>
          <p><em>"{selectedReview.comment}"</em></p>

          <div className="modal-buttons">
            <button
              className="confirm"
              onClick={() => {
                if (modalAction === "delete") {
                  handleDelete(selectedReview.productId, selectedReview._id);
                } else {
                  const newClass =
                    selectedReview.classification === "Fake" ? "Real" : "Fake";
                  handleEdit(selectedReview.productId, selectedReview._id, newClass);
                }
                setShowConfirm(false);
                setSelectedReview(null);
              }}
            >
              Confirm
            </button>
            <button
              className="cancel"
              onClick={() => {
                setShowConfirm(false);
                setSelectedReview(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default ModeratorDashboard;
