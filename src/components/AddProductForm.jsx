import React, { useState } from "react";
import "./AddProductForm.css";

const AddProductForm = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newProduct = {
      title,
      description,
      price: Number(price),
      imageUrl,
    };

    console.log("Submitting new product:", newProduct);

    if (!title || !description || !price || !imageUrl) {
      alert("Please fill in all fields.");
      return;
    }

    onAdd(newProduct);
  };

  return (
    <form className="add-product-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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
      <input
        type="text"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default AddProductForm;
