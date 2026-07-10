const express = require('express');
const {
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/hotel/:hotelId', getRooms);

// Protected routes (Hotel Owners and Admins)
router.post('/', protect, restrictTo('hotel_owner', 'admin'), createRoom);
router.put('/:id', protect, restrictTo('hotel_owner', 'admin'), updateRoom);
router.delete('/:id', protect, restrictTo('hotel_owner', 'admin'), deleteRoom);

module.exports = router;
