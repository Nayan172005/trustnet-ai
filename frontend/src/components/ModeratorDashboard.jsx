import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./ModeratorDashboard.css";

const ModeratorDashboard = () => {
  const [activeTab, setActiveTab] = useState("reviews");
  const [reviews, setReviews] = useState([]);
  const [filterReviewer, setFilterReviewer] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [onlyFake, setOnlyFake] = useState(false);
  const [reviewStats, setReviewStats] = useState({ fake: 0, real: 0 });
  const [productStats, setProductStats] = useState({ counterfeit: 0, genuine: 0 });
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [filterCounterfeit, setFilterCounterfeit] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");

  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
      fetchReviewStats();
    } else {
      fetchProducts();
      fetchProductStats();
    }
  }, [activeTab]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products/moderator/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products/moderator/review-stats");
      setReviewStats(res.data);
    } catch (err) {
      console.error("Error fetching review stats:", err);
    }
  };

  const fetchProductStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products/moderator/product-stats");
      setProductStats(res.data);
    } catch (err) {
      console.error("Error fetching product stats:", err);
    }
  };

  const handleDelete = async (productId, reviewId) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}/reviews/${reviewId}`);
      fetchReviews();
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
      fetchReviews();
    } catch (err) {
      console.error("Error editing review:", err);
    }
  };

  const handleProductStatusChange = async (productId, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      await axios.put(`http://localhost:5000/api/products/${productId}`, {
        isCounterfeit: updatedStatus,
      });
      fetchProducts();
      fetchProductStats();
    } catch (err) {
      console.error("Error updating product status:", err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      fetchProducts();
      fetchProductStats();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    return (
      (!filterReviewer || review.reviewer.toLowerCase().includes(filterReviewer.toLowerCase())) &&
      (!filterProduct || review.productTitle.toLowerCase().includes(filterProduct.toLowerCase())) &&
      (!onlyFake || review.classification === "Fake")
    );
  });

  const filteredProducts = products.filter((product) => {
    return (
      (!searchProduct || product.title.toLowerCase().includes(searchProduct.toLowerCase())) &&
      (!filterCounterfeit || product.isCounterfeit)
    );
  });

  const renderReviewsTab = () => (
    <>
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

      <div className="stats-container">
        <div className="stats-chart">
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
                setSelectedItem(review);
                setShowConfirm(true);
              }}
            >
              Delete
            </button>
            )}
            <button
              onClick={() => {
                setModalAction("edit");
                setSelectedItem(review);
                setShowConfirm(true);
              }}
            >
              {review.classification === "Fake" ? "Mark as Genuine" : "Mark as Fake"}
            </button>
          </div>
        </div>
      ))}
    </>
  );

  const renderProductsTab = () => (
    <>
      <div className="filters">
        <input
          type="text"
          placeholder="Search products"
          value={searchProduct}
          onChange={(e) => setSearchProduct(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={filterCounterfeit}
            onChange={(e) => setFilterCounterfeit(e.target.checked)}
          />
          Show only Counterfeit products
        </label>
      </div>

      <div className="stats-container">
        <div className="stats-chart">
          <h3>Counterfeit vs Genuine Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Counterfeit", value: productStats.counterfeit },
                  { name: "Genuine", value: productStats.genuine },
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
                formatter={(value, name) => [`${value} products`, name]} 
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
          <h3>Product Statistics</h3>
          <div className="stat-item">
            <span className="stat-label">Total Products:</span>
            <span className="stat-value total">{productStats.counterfeit + productStats.genuine}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Genuine Products:</span>
            <span className="stat-value real">{productStats.genuine} ({Math.round((productStats.genuine / (productStats.counterfeit + productStats.genuine || 1)) * 100)}%)</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Counterfeit Products:</span>
            <span className="stat-value fake">{productStats.counterfeit} ({Math.round((productStats.counterfeit / (productStats.counterfeit + productStats.genuine || 1)) * 100)}%)</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Last Updated:</span>
            <span className="stat-value">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="counterfeit-section">
        <div className="counterfeit-grid">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className={`counterfeit-card ${product.isCounterfeit ? "counterfeit" : "genuine"}`}
            >
              <p><strong>Product:</strong> {product.title}</p>
              <p><strong>Brand:</strong> {product.brand}</p>
              <p><strong>Status:</strong> 
                <span className={`status-badge ${product.isCounterfeit ? "counterfeit" : "genuine"}`}>
                  {product.isCounterfeit ? "Counterfeit" : "Genuine"}
                </span>
              </p>
              <p><strong>Confidence:</strong> 
                <span className="confidence-value">{product.predictionConfidence ? (product.predictionConfidence * 100).toFixed(1) : 'N/A'}%</span>
              </p>
              <div className="confidence-meter">
                <div 
                  className="confidence-meter-fill" 
                  style={{ width: `${product.predictionConfidence ? product.predictionConfidence * 100 : 0}%` }}
                />
              </div>
              <details>
                <summary>Explanation</summary>
                <p>{product.explanation || "No explanation available."}</p>
              </details>

              <div className="moderator-actions">
                <button
                  onClick={() => {
                    setModalAction("toggle-status");
                    setSelectedItem(product);
                    setShowConfirm(true);
                  }}
                >
                  {product.isCounterfeit ? "Mark as Genuine" : "Mark as Counterfeit"}
                </button>

                <button
                  onClick={() => {
                    setModalAction("delete-product");
                    setSelectedItem(product);
                    setShowConfirm(true);
                  }}
                  className="danger"
                >
                  Delete Product
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="moderator-dashboard">
      <h2>Moderator Dashboard</h2>
      
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Fake Review Detection
        </button>
        <button
          className={`tab-button ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Counterfeit Products
        </button>
      </div>

      {activeTab === "reviews" ? renderReviewsTab() : renderProductsTab()}

      {showConfirm && selectedItem && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Are you sure?</h3>
            <p>
              You are about to{" "}
              <strong>
                {modalAction === "delete"
                  ? "delete this review"
                  : modalAction === "edit"
                  ? "change classification of this review"
                  : modalAction === "delete-product"
                  ? "delete this product"
                  : modalAction === "toggle-status"
                  ? "change status of this product"
                  : "perform this action"}
              </strong>
            </p>
            <p><em>
              {modalAction === "toggle-status" || modalAction === "delete-product"
                ? selectedItem.title
                : selectedItem.comment}
            </em></p>

            <div className="modal-buttons">
              <button
                className="confirm"
                onClick={() => {
                  if (modalAction === "delete") {
                    handleDelete(selectedItem.productId, selectedItem._id);
                  } else if (modalAction === "edit") {
                    const newClass = selectedItem.classification === "Fake" ? "Real" : "Fake";
                    handleEdit(selectedItem.productId, selectedItem._id, newClass);
                  } else if (modalAction === "toggle-status") {
                    handleProductStatusChange(selectedItem._id, selectedItem.isCounterfeit);
                  }
                  else if (modalAction === "delete-product") {
                    handleDeleteProduct(selectedItem._id);
                  }
                  setShowConfirm(false);
                  setSelectedItem(null);
                }}
              >
                Confirm
              </button>
              <button
                className="cancel"
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedItem(null);
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