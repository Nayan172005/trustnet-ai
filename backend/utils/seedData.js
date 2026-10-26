const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

const CATALOG_DIR = path.join(__dirname, '../../ml/counterfeit_image_detection/datasets/sampled_sneakers_1024x1024');
const LEGACY_JSON_PATH = path.join(__dirname, '../data/products.json');

const INITIAL_SEEDS = [
  {
    id: "prod-1",
    title: "Nike Air Force 1 Low Brown Grey Classic Lifestyle Sneakers",
    brand: "Nike",
    price: 139.99,
    description: "Authentic Nike lifestyle sneaker featuring stitched overlays, bold color accents, and full-length Nike Air cushioning.",
    image_url: "/catalog/normalized_nike_0.jpg",
    server_image_path: path.join(CATALOG_DIR, "normalized_nike_0.jpg"),
    created_at: new Date(Date.now() - 3600000 * 24),
    prediction: "GENUINE",
    diagnostic: "High Confidence Authentic: Validated across metadata and visual metric retrieval",
    trust_score: 0.9690,
    metadata_score: 0.9935,
    brand_match_ratio: 1.0,
    retrieval_confidence: 0.8149,
    query_brand: "nike",
    retrieved_items: [
      { filename: "normalized_nike_150.jpg", similarity: 0.8331, brand: "nike", metadata: "Nike Air Force 1 Low Grey Charcoal Low Running Shoes" },
      { filename: "normalized_nike_314.jpg", similarity: 0.8140, brand: "nike", metadata: "Nike Pegasus Brown Charcoal Leather Lifestyle Shoes" },
      { filename: "normalized_nike_180.jpg", similarity: 0.8102, brand: "nike", metadata: "Nike Air Force 1 Low Grey Purple Sport Training Shoes" },
      { filename: "normalized_nike_263.jpg", similarity: 0.8102, brand: "nike", metadata: "Nike Court Vision Low Blue Grey Low Top Athletic Trainers" },
      { filename: "normalized_nike_268.jpg", similarity: 0.8071, brand: "nike", metadata: "Nike Court Vision Low Grey White Lifestyle Shoes" }
    ],
    review_bombing_detected: false,
    reviews: [
      {
        id: "rev-1",
        author: "Marcus V.",
        rating: 5,
        review_text: "Can't go wrong with the classic Chuck! Great quality and fits true to size.",
        timestamp: new Date(Date.now() - 3600000 * 12),
        is_fake: false,
        verdict: "Genuine",
        prob_fake: 0.2105,
        prob_genuine: 0.7895
      },
      {
        id: "rev-2",
        author: "Sarah L.",
        rating: 4,
        review_text: "Loved the shoe - super comfortable. Only problem was slight box damage.",
        timestamp: new Date(Date.now() - 3600000 * 6),
        is_fake: false,
        verdict: "Genuine",
        prob_fake: 0.1240,
        prob_genuine: 0.8760
      }
    ]
  },
  {
    id: "prod-2",
    title: "Puma RS-X White Navy Lifestyle Sneakers",
    brand: "Puma",
    price: 110.00,
    description: "Bulky retro silhouette inspired by Puma heritage running technology with cushioned midsole.",
    image_url: "/catalog/resized_padded_puma_10.jpg",
    server_image_path: path.join(CATALOG_DIR, "resized_padded_puma_10.jpg"),
    created_at: new Date(Date.now() - 3600000 * 20),
    prediction: "GENUINE",
    diagnostic: "High Confidence Authentic: Validated across metadata and visual metric retrieval",
    trust_score: 0.9520,
    metadata_score: 1.0000,
    brand_match_ratio: 1.0,
    retrieval_confidence: 0.7600,
    query_brand: "puma",
    retrieved_items: [
      { filename: "resized_padded_puma_105.jpg", similarity: 0.7920, brand: "puma", metadata: "Puma Suede Charcoal White Retro Sneakers" },
      { filename: "resized_padded_puma_106.jpg", similarity: 0.7710, brand: "puma", metadata: "Puma Cell Navy Grey Streetwear Trainers" },
      { filename: "resized_padded_puma_107.jpg", similarity: 0.7650, brand: "puma", metadata: "Puma RS-X Black White Classic Running Shoes" },
      { filename: "resized_padded_puma_108.jpg", similarity: 0.7420, brand: "puma", metadata: "Puma RS-X Grey White Lifestyle Sneakers" },
      { filename: "resized_padded_puma_109.jpg", similarity: 0.7300, brand: "puma", metadata: "Puma Suede White Navy Heritage Trainers" }
    ],
    review_bombing_detected: false,
    reviews: [
      {
        id: "rev-3",
        author: "Alex B.",
        rating: 5,
        review_text: "Solid pair of sneakers. Very supportive arch.",
        timestamp: new Date(Date.now() - 3600000 * 4),
        is_fake: false,
        verdict: "Genuine",
        prob_fake: 0.0820,
        prob_genuine: 0.9180
      }
    ]
  },
  {
    id: "prod-3",
    title: "Vans Old Skool Black White Skate Shoes Limited Edition Premium Release",
    brand: "Vans",
    price: 79.99,
    description: "Low top lace-up featuring sturdy canvas and suede uppers with re-enforced toe caps.",
    image_url: "/catalog/resized_all_vans_102.jpg",
    server_image_path: path.join(CATALOG_DIR, "resized_all_vans_102.jpg"),
    created_at: new Date(Date.now() - 3600000 * 10),
    prediction: "COUNTERFEIT",
    diagnostic: "Counterfeit Detected: Deceptive listing style or synthetic metadata anomaly",
    trust_score: 0.4680,
    metadata_score: 0.0000,
    brand_match_ratio: 1.0,
    retrieval_confidence: 0.7860,
    query_brand: "vans",
    retrieved_items: [
      { filename: "resized_all_vans_103.jpg", similarity: 0.8120, brand: "vans", metadata: "Vans Old Skool Black White Skate Shoes" },
      { filename: "resized_all_vans_104.jpg", similarity: 0.7940, brand: "vans", metadata: "Vans Classic Slip-On Checkerboard Skate Shoes" },
      { filename: "resized_all_vans_105.jpg", similarity: 0.7810, brand: "vans", metadata: "Vans Sk8-Hi Black White Skate Shoes" },
      { filename: "resized_all_vans_106.jpg", similarity: 0.7750, brand: "vans", metadata: "Vans Era White Navy Streetwear Sneakers" },
      { filename: "resized_all_vans_107.jpg", similarity: 0.7680, brand: "vans", metadata: "Vans Authentic Black White Skate Shoes" }
    ],
    review_bombing_detected: false,
    reviews: [
      {
        id: "rev-4",
        author: "Jason K.",
        rating: 1,
        review_text: "worst worst worst. Do not buy. worst.",
        timestamp: new Date(Date.now() - 3600000 * 3),
        is_fake: true,
        verdict: "Fake",
        prob_fake: 0.9850,
        prob_genuine: 0.0150
      }
    ]
  },
  {
    id: "prod-4",
    title: "Puma RS-X Lifestyle Streetwear Running Shoes",
    brand: "Puma",
    price: 125.00,
    description: "Listing titled as Puma but supplied with Nike footwear imagery.",
    image_url: "/catalog/normalized_nike_1.jpg",
    server_image_path: path.join(CATALOG_DIR, "normalized_nike_1.jpg"),
    created_at: new Date(Date.now() - 3600000 * 5),
    prediction: "SUSPICIOUS",
    diagnostic: "Brand Mismatch: Claimed 'puma', but catalog visual retrieval matched Nike catalog sneakers",
    trust_score: 0.6210,
    metadata_score: 1.0000,
    brand_match_ratio: 0.0,
    retrieval_confidence: 0.8060,
    query_brand: "puma",
    retrieved_items: [
      { filename: "normalized_nike_0.jpg", similarity: 0.8410, brand: "nike", metadata: "Nike Air Force 1 Low Brown Grey Classic Lifestyle Sneakers" },
      { filename: "normalized_nike_10.jpg", similarity: 0.8190, brand: "nike", metadata: "Nike Air Force 1 Low Grey Charcoal Low Basketball Sneakers" },
      { filename: "normalized_nike_11.jpg", similarity: 0.8020, brand: "nike", metadata: "Nike Air Max Orange White Low Basketball Shoes" },
      { filename: "normalized_nike_12.jpg", similarity: 0.7950, brand: "nike", metadata: "Nike Dunk Low Purple Green Everyday Streetwear Shoes" },
      { filename: "normalized_nike_13.jpg", similarity: 0.7730, brand: "nike", metadata: "Nike Zoom Grey Brown Low Top Athletic Shoes" }
    ],
    review_bombing_detected: false,
    reviews: []
  }
];

async function seedInitialData() {
  try {
    const prod1Exists = await Product.findOne({ id: "prod-1" });
    if (!prod1Exists) {
      console.log(`[Seed] Seeding initial rich footwear products into MongoDB...`);
      for (const item of INITIAL_SEEDS) {
        await Product.findOneAndUpdate(
          { id: item.id },
          { $setOnInsert: item },
          { upsert: true, new: true }
        );
      }
      console.log(`[Seed] Successfully seeded ${INITIAL_SEEDS.length} authentic footwear products in MongoDB.`);
    }

    const count = await Product.countDocuments();
    console.log(`[Seed] Total products currently in MongoDB: ${count}`);
  } catch (error) {
    console.error(`[Seed] Error seeding initial data:`, error.message);
  }
}

module.exports = seedInitialData;

