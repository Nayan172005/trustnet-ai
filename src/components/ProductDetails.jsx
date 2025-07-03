import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewer, setReviewer] = useState("");


  const fetchProduct = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) return <div>Loading Product...</div>;

  if (!product) return <div>Product not found.</div>;

  return (
    <div className="product-details-container">
      <div className="product-details-card">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="product-image"
        />
        <div className="product-info">
          <h2>{product.title}</h2>
          <p>{product.description}</p>
          <p>
            <strong>Price:</strong> ₹{product.price}
          </p>
        </div>
      </div>.
      {/* Add Review Form goes here */}
      <div className="add-review">
        <h3>Reviews</h3>
        {product.reviews?.length > 0 ? (
          product.reviews.map((review, index) => (
            <div key={index} className="review">
              <strong>{review.reviewer}</strong> ({review.rating}⭐): {review.comment}
              <br />
              <span style={{ fontSize: "0.9em", color: "gray" }}>
                {review.classification && (
                  <>
                    <strong>{review.classification}</strong> – {review.explanation}
                  </>
                )}
              </span>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
        <h3>Add a Review</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await axios.post(`http://localhost:5000/api/products/${id}/reviews`, {
                reviewer,
                comment,
                rating,
              });
              setComment("");
              setRating(5);
              setReviewer("");
              fetchProduct(); // refresh the reviews
            } catch (err) {
              console.error("Failed to add review", err);
            }
          }}
        >
          <input
            type="text"
            placeholder="Your name"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            required
          />
          <textarea
            placeholder="Write your review"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} Star</option>
            ))}
          </select>
          <button type="submit">Submit Review</button>
        </form>
      </div>
    </div>
  );
};

export default ProductDetails;