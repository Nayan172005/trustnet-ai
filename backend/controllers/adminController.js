const Product = require('../models/Product');

/**
 * @desc Get comprehensive admin metrics, pie chart breakdowns, and review bombing incidents
 * @route GET /api/admin/stats
 */
const getAdminStats = async (req, res) => {
  try {
    const products = await Product.find().sort({ created_at: -1 });

    let totalProducts = products.length;
    let genuineCount = 0;
    let suspiciousCount = 0;
    let counterfeitCount = 0;

    let totalReviews = 0;
    let genuineReviews = 0;
    let fakeReviews = 0;

    const reviewBombingIncidents = [];
    const brandBreakdown = {};

    const productDetails = products.map(p => {
      const pObj = p.toJSON();
      const verdict = (pObj.prediction || 'SUSPICIOUS').toUpperCase();

      if (verdict.includes('GENUINE')) {
        genuineCount++;
      } else if (verdict.includes('COUNTERFEIT')) {
        counterfeitCount++;
      } else {
        suspiciousCount++;
      }

      const brand = pObj.brand || 'Other';
      brandBreakdown[brand] = (brandBreakdown[brand] || 0) + 1;

      const revs = pObj.reviews || [];
      let pFakeCount = 0;
      let pGenCount = 0;

      revs.forEach(r => {
        totalReviews++;
        if (r.is_fake) {
          fakeReviews++;
          pFakeCount++;
        } else {
          genuineReviews++;
          pGenCount++;
        }
      });

      if (pObj.review_bombing_detected) {
        reviewBombingIncidents.push({
          product_id: pObj.id,
          product_title: pObj.title,
          brand: pObj.brand,
          recent_fake_count: pObj.review_bombing_count || pFakeCount,
          last_detected: pObj.review_bombing_last_detected || pObj.created_at,
          message: pObj.review_bombing_message
        });
      }

      return {
        id: pObj.id,
        title: pObj.title,
        brand: pObj.brand,
        prediction: pObj.prediction,
        diagnostic: pObj.diagnostic,
        trust_score: pObj.trust_score,
        metadata_score: pObj.metadata_score,
        brand_match_ratio: pObj.brand_match_ratio,
        retrieval_confidence: pObj.retrieval_confidence,
        reviews_total: revs.length,
        reviews_genuine: pGenCount,
        reviews_fake: pFakeCount,
        review_bombing_detected: Boolean(pObj.review_bombing_detected),
        image_url: pObj.image_url
      };
    });

    res.json({
      kpis: {
        total_products: totalProducts,
        genuine_products: genuineCount,
        suspicious_products: suspiciousCount,
        counterfeit_products: counterfeitCount,
        total_reviews: totalReviews,
        genuine_reviews: genuineReviews,
        fake_reviews: fakeReviews,
        review_bombing_alerts_count: reviewBombingIncidents.length
      },
      review_bombing_incidents: reviewBombingIncidents,
      brand_breakdown: brandBreakdown,
      products: productDetails
    });
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({ error: `Failed to calculate admin stats: ${error.message}` });
  }
};

/**
 * @desc Clear/dismiss a review bombing incident on a product
 * @route POST /api/admin/clear-bombing/:id
 */
const clearReviewBombing = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    product.review_bombing_detected = false;
    product.review_bombing_count = 0;
    product.review_bombing_message = null;
    await product.save();

    res.json({ success: true, message: 'Review bombing alert dismissed.' });
  } catch (error) {
    console.error('Error in clearReviewBombing:', error);
    res.status(500).json({ error: `Failed to clear alert: ${error.message}` });
  }
};

module.exports = {
  getAdminStats,
  clearReviewBombing
};
