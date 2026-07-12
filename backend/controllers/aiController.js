const geminiService = require('../services/geminiService');

const generateItinerary = async (req, res) => {
  try {
    const { destination, duration, travelers, interests } = req.body;

    // Validate all required fields
    if (!destination || !duration || !travelers || !interests) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: destination, duration, travelers, and interests are all required.'
      });
    }

    // Call the service to generate the itinerary
    const itineraryText = await geminiService.generateTripItinerary({
      destination,
      duration,
      travelers,
      interests
    });

    // Return successful response
    return res.status(200).json({
      success: true,
      itinerary: itineraryText
    });
  } catch (error) {
    console.error('Error generating itinerary in aiController:', error);
    
    // Check if it's an API key error for clearer messaging
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({
        success: false,
        message: 'AI Service configuration error: Invalid or missing API key.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error while generating itinerary. Please try again later.'
    });
  }
};

module.exports = {
  generateItinerary
};
