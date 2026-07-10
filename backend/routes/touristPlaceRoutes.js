const express = require('express');
const {
  createPlace,
  getAllPlaces,
  getPlaceById,
  updatePlace,
  deletePlace
} = require('../controllers/touristPlaceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllPlaces);
router.get('/:id', getPlaceById);

// Admin-only protected routes
router.post('/', protect, restrictTo('admin'), createPlace);
router.put('/:id', protect, restrictTo('admin'), updatePlace);
router.delete('/:id', protect, restrictTo('admin'), deletePlace);

module.exports = router;
