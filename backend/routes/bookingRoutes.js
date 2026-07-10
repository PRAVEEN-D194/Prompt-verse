const express = require('express');
const {
  bookRoom,
  getMyBookings,
  getHotelBookings,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// Tourist routes
router.post('/', restrictTo('tourist'), bookRoom);
router.get('/my-bookings', restrictTo('tourist'), getMyBookings);

// Hotel Owner / Admin routes
router.get('/hotel-bookings/:hotelId', restrictTo('hotel_owner', 'admin'), getHotelBookings);
router.patch('/:id/status', restrictTo('hotel_owner', 'admin'), updateBookingStatus);

// Cancel route (Any authorized party: Tourist owner, Hotel owner, Admin)
router.post('/:id/cancel', cancelBooking);

module.exports = router;
