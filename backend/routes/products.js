const express = require("express");
const axios = require("axios");
const multer = require("multer");
const { storage } = require("../utils/cloudinary"); // you already created this earlier
const upload = multer({ storage });
// const upload = multer();
const util = require("util");

const router = express.Router();
const Product = require("../models/Product");

// GET all products
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// POST new product with Cloudinary image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, brand, description, price } = req.body;
    const imageUrl = req.file?.path;

    if (!imageUrl) throw new Error("Image upload failed: No file path received from Cloudinary.");

    const product = new Product({
      title,
      brand,
      description,
      price,
      imageUrl,
    });

    await product.save();

    console.log("✅ Product saved:", product);
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Product upload failed:", err.message);
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

// ADD REVIEW to a product and classify via Mistral
router.post("/:id/reviews", async (req, res) => {
  const { reviewer, comment, rating } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const mistralResponse = await axios.post("http://localhost:5001/v1/chat/completions", {
      model: "mistral-7b-instruct-v0.2.Q4_K_M.gguf",
      messages: [
        {
          role: "user",
          content: `
You are a helpful assistant that identifies whether a given product review is fake or real.

A fake review often:
- Overuses positive/negative words with little substance
- Sounds exaggerated or robotic
- Lacks product-specific details
- Repeats generic phrases
- May be copied or unusually short/long

Your task is to classify the review and provide a short explanation.

Respond strictly in this format:
Classification: Fake or Real  
Explanation: (one-line reasoning)

Review: "${comment}"
`
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });

    const output = mistralResponse.data.choices[0].message.content;
    const classification = output.match(/Classification:\s*(Fake|Real)/i)?.[1] || "Unknown";
    const explanation = output.match(/Explanation:\s*([\s\S]+)/i)?.[1]?.trim() || "No explanation.";
    
    product.reviews.push({ reviewer, comment, rating, classification, explanation });
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to add review" });
  }
});

// GET product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Moderator dashboard route - returns all reviews across all products
router.get("/moderator/reviews", async (req, res) => {
  try {
    const products = await Product.find();
    const allReviews = [];

    products.forEach((product) => {
      product.reviews.forEach((review) => {
        allReviews.push({
          productId: product._id,
          productTitle: product.title,
          ...review._doc,
        });
      });
    });

    res.json(allReviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a review
router.delete("/:productId/reviews/:reviewId", async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.reviews = product.reviews.filter((r) => r._id.toString() !== reviewId);
    await product.save();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete review" });
  }
});

// PUT (EDIT) a review classification
router.put("/:productId/reviews/:reviewId", async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const { classification, explanation } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.classification = classification;
    review.explanation = explanation;
    await product.save();

    res.json({ message: "Review updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update review" });
  }
});

// Review stats
router.get("/moderator/review-stats", async (req, res) => {
  try {
    const products = await Product.find();
    let fake = 0, real = 0;

    products.forEach((product) => {
      product.reviews.forEach((review) => {
        if (review.classification === "Fake") fake++;
        else if (review.classification === "Real") real++;
      });
    });

    res.json({ fake, real });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
