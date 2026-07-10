const express = require('express');
const {
  createItinerary,
  getMyItineraries,
  updateItinerary,
  deleteItinerary
} = require('../controllers/itineraryController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All itinerary routes require authentication and are restricted to tourists
router.use(protect, restrictTo('tourist'));

router.post('/', createItinerary);
router.get('/', getMyItineraries);
router.put('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);

module.exports = router;
