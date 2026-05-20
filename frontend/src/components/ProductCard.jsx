import React from "react";
import "./ProductCard.css";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <div onClick={handleCardClick} className="product-card">
      <div className="image-container">
        <img src={product.imageUrl} alt={product.title} />
      </div>
      <div className="product-info">
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <p>₹{product.price}</p>
      </div>
    </div>
  );
};

// const ProductCard = ({ product, onAddReview }) => {
//   return (
//     <Link to={`/product/${product._id}`} className="product-card">
//       <div className="image-container">
//         <img src={product.imageUrl} alt={product.title} />
//       </div>
//       <div className="product-info">
//         <h3>{product.title}</h3>
//         <p>{product.description}</p>
//         <p>₹{product.price}</p>
//       </div>
//     </Link>
//   );
// };

export default ProductCard;
