import React, { useState } from "react";
import "./AddProductForm.css";

const AddProductForm = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 🔁 loading state

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !brand || !description || !price || !imageFile) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("brand", brand);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("image", imageFile);

    setIsLoading(true); // ⏳ show spinner
    try {
      await onAdd(formData); // your backend call
      setTimeout(() => {
        window.location.reload(); // 🔄 refresh page after short delay
      }, 500);
    } catch (err) {
      console.error("Error adding product:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="add-product-wrapper">
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing product... Please wait.</p>
        </div>
      )}

      <form className="add-product-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Product Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Brand Name"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: "150px", height: "auto", marginTop: "10px" }}
          />
        )}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddProductForm;
