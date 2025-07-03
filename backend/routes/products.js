const express = require("express");
const axios = require("axios");
const router = express.Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.post("/", async (req, res) => {
  try {
    const { title, description, price, imageUrl } = req.body;
    const product = new Product({ title, description, price, imageUrl });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/reviews", async (req, res) => {
  const { reviewer, comment, rating } = req.body;

  try {
    console.log("🔹 Incoming review:", { reviewer, comment, rating });

    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log("❌ Product not found");
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("✅ Product found, sending to Mistral...");

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

Review: "This is the best product ever! Works like magic!"  
Classification: Fake

Review: "I bought this for my camera and the battery life doubled. Totally worth it."  
Classification: Real

Analyze the review and respond with:
Classification: Fake or Real
Explanation: (brief reasoning)

Review: "${comment}"
`
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });

    console.log("✅ Got response from Mistral:", mistralResponse.data);

    const output = mistralResponse.data.choices[0].message.content;

    const classification = output.match(/Classification:\s*(Fake|Real)/i)?.[1] || "Unknown";
    const explanation = output.match(/Explanation:\s*(.+)/i)?.[1] || "No explanation.";

    console.log("🧠 Parsed:", { classification, explanation });

    product.reviews.push({ reviewer, comment, rating, classification, explanation });
    await product.save();

    console.log("💾 Review saved");
    res.status(201).json(product);

  } catch (err) {
    console.error("❌ Error saving review or contacting Mistral:", err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to add review" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
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

module.exports = router;
