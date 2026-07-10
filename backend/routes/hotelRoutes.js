const express = require('express');
const {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel
} = require('../controllers/hotelController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllHotels);
router.get('/:id', getHotelById);

// Protected routes (Hotel Owners and Admins)
router.post('/', protect, restrictTo('hotel_owner', 'admin'), createHotel);
router.put('/:id', protect, restrictTo('hotel_owner', 'admin'), updateHotel);
router.delete('/:id', protect, restrictTo('hotel_owner', 'admin'), deleteHotel);

module.exports = router;
