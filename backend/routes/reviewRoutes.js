const express = require('express');
const {
  createReview,
  getReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route
router.get('/', getReviews);

// Protected routes
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
