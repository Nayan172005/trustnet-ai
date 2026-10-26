/**
 * Review Bombing Rate Limiting Detection Utility
 * Checks whether k fake reviews were posted within t minutes on a product.
 */

const DEFAULT_THRESHOLD_K = Number(process.env.BOMBING_THRESHOLD) || 3;
const DEFAULT_TIMEFRAME_MINUTES = Number(process.env.BOMBING_TIMEFRAME_MINUTES) || 5;

function evaluateReviewBombing(product, thresholdK = DEFAULT_THRESHOLD_K, timeframeMinutes = DEFAULT_TIMEFRAME_MINUTES) {
  const now = Date.now();
  const timeframeMs = timeframeMinutes * 60 * 1000;

  const reviews = product.reviews || [];

  // Filter fake reviews that were submitted within the sliding window
  const recentFakeReviews = reviews.filter(r => {
    if (!r.is_fake) return false;
    const rTime = new Date(r.timestamp).getTime();
    return (now - rTime) <= timeframeMs;
  });

  if (recentFakeReviews.length >= thresholdK) {
    product.review_bombing_detected = true;
    product.review_bombing_count = recentFakeReviews.length;
    product.review_bombing_last_detected = new Date();
    product.review_bombing_message = `Review bombing detected: ${recentFakeReviews.length} coordinated fake reviews submitted within ${timeframeMinutes} minutes.`;
    return {
      bombingDetected: true,
      count: recentFakeReviews.length,
      message: product.review_bombing_message
    };
  }

  return {
    bombingDetected: Boolean(product.review_bombing_detected),
    count: product.review_bombing_count || 0,
    message: product.review_bombing_message || null
  };
}

module.exports = {
  evaluateReviewBombing,
  DEFAULT_THRESHOLD_K,
  DEFAULT_TIMEFRAME_MINUTES
};
