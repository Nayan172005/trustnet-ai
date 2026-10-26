const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  clearReviewBombing
} = require('../controllers/adminController');

// Admin routes
router.get('/stats', getAdminStats);
router.post('/clear-bombing/:id', clearReviewBombing);

module.exports = router;
