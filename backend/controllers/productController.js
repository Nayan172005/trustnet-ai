const Product = require('../models/Product');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

/**
 * @desc Get all footwear products with filters
 * @route GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const { verdict, brand } = req.query;
    const query = {};

    if (verdict && verdict !== 'ALL') {
      query.prediction = new RegExp(`^${verdict}$`, 'i');
    }
    if (brand && brand !== 'ALL') {
      query.brand = new RegExp(`^${brand}$`, 'i');
    }

    const products = await Product.find(query).sort({ created_at: -1 });

    const enriched = products.map(p => {
      const pObj = p.toJSON();
      const revs = pObj.reviews || [];
      const avgRating = revs.length > 0
        ? Number((revs.reduce((acc, r) => acc + r.rating, 0) / revs.length).toFixed(1))
        : 5.0;

      return {
        ...pObj,
        avg_rating: avgRating,
        reviews_count: revs.length,
        fake_reviews_count: revs.filter(r => r.is_fake).length
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ error: `Failed to fetch products: ${error.message}` });
  }
};

/**
 * @desc Get single product by custom id
 * @route GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const pObj = product.toJSON();
    const revs = pObj.reviews || [];
    const avgRating = revs.length > 0
      ? Number((revs.reduce((acc, r) => acc + r.rating, 0) / revs.length).toFixed(1))
      : 5.0;

    res.json({
      ...pObj,
      avg_rating: avgRating,
      reviews_count: revs.length,
      fake_reviews_count: revs.filter(r => r.is_fake).length
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ error: `Failed to fetch product: ${error.message}` });
  }
};

/**
 * @desc Upload and evaluate new product through ML inference pipeline
 * @route POST /api/products
 */
const createProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Product image is required.' });
    }

    const { title, brand, price, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Product listing title / metadata is required.' });
    }

    const uploadedImagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    console.log(`[ProductController] Analyzing new product: "${title}" [${uploadedImagePath}]`);

    // Call Python ML Inference Service
    let mlResult = null;
    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/predict_product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_path: uploadedImagePath,
          metadata: title.trim()
        })
      });

      if (!mlResponse.ok) {
        const errText = await mlResponse.text();
        throw new Error(`ML Service error ${mlResponse.status}: ${errText}`);
      }
      mlResult = await mlResponse.json();
    } catch (mlErr) {
      console.error('[ProductController] ML Service connection error:', mlErr.message);
      return res.status(500).json({
        error: `ML Service Error: ${mlErr.message}. Ensure ML inference service is running on port 5001.`
      });
    }

    // Create MongoDB Product Document
    const newProduct = new Product({
      id: `prod-${Date.now()}`,
      title: title.trim(),
      brand: brand || mlResult.query_brand || 'Generic',
      price: price ? Number(price) : 99.99,
      description: description ? description.trim() : 'Footwear product listing evaluated by TrustNet-AI multimodal authenticity inspection.',
      image_url: imageUrl,
      server_image_path: uploadedImagePath,
      prediction: mlResult.verdict || 'SUSPICIOUS',
      diagnostic: mlResult.diagnostic || '',
      trust_score: mlResult.trust_score,
      metadata_score: mlResult.metadata_score,
      brand_match_ratio: mlResult.brand_match_ratio,
      retrieval_confidence: mlResult.retrieval_confidence,
      query_brand: mlResult.query_brand,
      retrieved_items: mlResult.retrieved_items || [],
      review_bombing_detected: false,
      reviews: []
    });

    const savedProduct = await newProduct.save();
    console.log(`[ProductController] Product saved to MongoDB: ${savedProduct.id} -> ${savedProduct.prediction} (${savedProduct.trust_score})`);

    res.status(201).json(savedProduct.toJSON());
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct
};
