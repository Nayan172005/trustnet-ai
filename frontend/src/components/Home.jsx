import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import AddProductForm from "./AddProductForm";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

const handleAddProduct = async (newProductFormData) => {
  try {
    // const res = await axios.post("http://localhost:5000/api/products", newProductFormData, {
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    // });
    const res=await axios.post("http://localhost:5000/api/products", newProductFormData);
    console.log("✅ Upload success:", res.data);
  } catch (err) {
    console.error("❌ Upload failed:", JSON.stringify(err?.response?.data || err.message, null, 2));
  }
};

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const goToModeratorDashboard = () => {
    navigate("/moderator");
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>TrustNet - Product Page</h1>
        <div className="home-header-buttons">
          <button
            className="home-add-button"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : "Add Product"}
          </button>
          <button
            className="home-moderator-button"
            onClick={goToModeratorDashboard}
          >
            Moderator Dashboard
          </button>
        </div>
      </div>

      {showAddForm && <AddProductForm onAdd={handleAddProduct} />}

      <div className="product-list">
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((product) => (
            <div key={product._id} onClick={() => handleProductClick(product._id)}>
              <ProductCard product={product} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
