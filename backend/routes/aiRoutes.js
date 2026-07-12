const express = require('express');
const { generateItinerary } = require('../controllers/aiController');

const router = express.Router();

// POST /api/ai/generate-itinerary
router.post('/generate-itinerary', generateItinerary);

module.exports = router;
