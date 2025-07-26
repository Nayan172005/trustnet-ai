const express = require("express");
const axios = require("axios");
const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const upload = multer({ storage });
const { spawn } = require("child_process");
const path = require("path");
const router = express.Router();
const Product = require("../models/Product");

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new product with Cloudinary image upload and counterfeit check
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("🔹 [POST] Product upload triggered.");
    const { title, brand, description, price } = req.body;
    console.log("📝 Form Fields:", { title, brand, description, price });

    const imageUrl = req.file?.path || req.file?.secure_url || req.body.image;
    if (!imageUrl) throw new Error("Image upload failed: No image path provided.");
    console.log("🖼️ Image URL:", imageUrl);

    const inputPayload = JSON.stringify({ title, brand, description, image_url: imageUrl });
    console.log("📦 Python Input Payload:", inputPayload);

    const scriptPath = path.resolve(__dirname, "../../ml/predict_counterfeit.py");
    const python = spawn("python", [scriptPath]);

    let result = "";
    let errorOutput = "";

    python.stdin.write(inputPayload);
    python.stdin.end();

    python.stdout.on("data", (data) => {
      const chunk = data.toString();
      console.log("📥 [Python stdout]:", chunk);
      result += chunk;
    });

    python.stderr.on("data", (data) => {
      const err = data.toString();
      console.error("❌ [Python stderr]:", err);
      errorOutput += err;
    });

    python.on("close", async (code) => {
      console.log("🔚 [Python process closed] Exit code:", code);
      if (errorOutput) console.error("⚠️ Python stderr output:", errorOutput);

      try {
        const output = JSON.parse(result);
        console.log("📤 Parsed Python Output:", output);

        if (output.error) {
          console.error("❌ Python Script Error:", output.error);
          if (!res.headersSent)
            return res.status(500).json({ message: "Prediction failed", error: output.error });
        }

        const payload = {
          title,
          brand,
          description,
          price,
          imageUrl,
          isCounterfeit: output.prediction === 1,
          predictionConfidence: output.confidence,
          explanation: output.explanation,
        };

        const product = new Product(payload);
        await product.save();
        console.log("✅ Product saved to DB:", product._id);

        if (!res.headersSent) res.status(201).json(product);
      } catch (err) {
        console.error("❌ JSON Parse or Save Failed:", err.message);
        console.log("🔍 Raw Python Output (not parsed):", result);
        if (!res.headersSent)
          res.status(500).json({ message: "Counterfeit detection failed", error: err.message });
      }
    });
  } catch (err) {
    console.error("❌ Upload/Prediction Flow Failed:", err.message);
    if (!res.headersSent) res.status(500).json({ message: err.message || "Upload failed" });
  }
});

// POST Review
router.post("/:id/reviews", async (req, res) => {
  const { reviewer, comment, rating } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const mistralResponse = await axios.post("http://localhost:5001/v1/chat/completions", {
      model: "mistral-7b-instruct-v0.2.Q4_K_M.gguf",
      messages: [{
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
      }],
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
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all reviews for moderator
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
    if (!product)
      return res.status(404).json({ message: "Product not found" });

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
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review)
      return res.status(404).json({ message: "Review not found" });

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

// Product stats (counterfeit vs genuine)
router.get("/moderator/product-stats", async (req, res) => {
  try {
    const counterfeitCount = await Product.countDocuments({ isCounterfeit: true });
    const genuineCount = await Product.countDocuments({ isCounterfeit: false });
    
    res.json({ 
      counterfeit: counterfeitCount, 
      genuine: genuineCount 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT (toggle product counterfeit status)
router.put("/:id", async (req, res) => {
  try {
    const { isCounterfeit } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isCounterfeit },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("❌ Failed to update product:", err.message);
    res.status(500).json({ message: "Failed to update product status" });
  }
});

// DELETE a product
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Failed to delete product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;