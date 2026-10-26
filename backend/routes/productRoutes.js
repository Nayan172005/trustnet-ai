const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  getAllProducts,
  getProductById,
  createProduct
} = require('../controllers/productController');
const { addReview } = require('../controllers/reviewController');

// Product routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', upload.single('image'), createProduct);

// Nested reviews route on product
router.post('/:id/reviews', addReview);

module.exports = router;
