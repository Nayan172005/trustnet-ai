import React, { useState } from "react";
import "./AddProductForm.css";

const AddProductForm = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 handleSubmit triggered");

    if (!title || !brand || !description || !price || !imageFile) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("brand", brand);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("image", imageFile);  // Make sure this is a File object!

    // DEBUG LOGGING
    for (let pair of formData.entries()) {
      console.log(`📝 ${pair[0]}:`, pair[1]);
    }

    onAdd(formData);
  };

  return (
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
  );
};

export default AddProductForm;
