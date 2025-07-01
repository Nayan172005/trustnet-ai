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

  const handleAddProduct = async (newProduct) => {
    try {
      const res = await axios.post("http://localhost:5000/api/products", newProduct);
      setProducts((prev) => [...prev, res.data]);
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>TrustNet - Product Page</h1>
        <button
          className="home-add-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "Add Product"}
        </button>
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
