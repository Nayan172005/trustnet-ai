const Product = require('../models/Product');
const { evaluateReviewBombing } = require('../utils/reviewBombing');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

/**
 * @desc Add customer review and run sequential NLP fake detection
 * @route POST /api/products/:id/reviews
 */
const addReview = async (req, res) => {
  try {
    const { rating, review_text, author } = req.body;
    if (!review_text || !rating) {
      return res.status(400).json({ error: 'Rating and review_text are required.' });
    }

    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Call Python ML Inference Service for BiLSTM review classification
    let mlReviewResult = null;
    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/predict_review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_text: review_text.trim(),
          rating: Number(rating)
        })
      });

      if (!mlResponse.ok) {
        const errText = await mlResponse.text();
        throw new Error(`ML Review model error ${mlResponse.status}: ${errText}`);
      }
      mlReviewResult = await mlResponse.json();
    } catch (mlErr) {
      console.error('[ReviewController] Failed to predict review authenticity:', mlErr.message);
      return res.status(500).json({ error: `ML Service Error: ${mlErr.message}` });
    }

    const newReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: author ? author.trim() : 'Amazon Customer',
      rating: Number(rating),
      review_text: review_text.trim(),
      timestamp: new Date(),
      is_fake: mlReviewResult.is_fake,
      verdict: mlReviewResult.verdict,
      prob_fake: mlReviewResult.prob_fake,
      prob_genuine: mlReviewResult.prob_genuine
    };

    if (!product.reviews) {
      product.reviews = [];
    }
    product.reviews.unshift(newReview);

    // Evaluate Review Bombing Rate Limiting logic
    const bombingStatus = evaluateReviewBombing(product);

    await product.save();

    console.log(
      `[ReviewController] Review saved on ${product.id}: Verdict=${newReview.verdict} ` +
      `(Fake prob: ${newReview.prob_fake}) Bombing alert=${product.review_bombing_detected}`
    );

    res.status(201).json({
      review: newReview,
      review_bombing_detected: product.review_bombing_detected,
      review_bombing_message: product.review_bombing_message || null,
      review_bombing_count: product.review_bombing_count || 0
    });
  } catch (error) {
    console.error('Error in addReview:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

module.exports = {
  addReview
};
