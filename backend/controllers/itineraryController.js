const Itinerary = require('../models/itineraryModel');

const createItinerary = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const touristId = req.user.id;

    if (!title) {
      return res.status(400).json({
        status: 'fail',
        message: 'Title is required for an itinerary.'
      });
    }

    const itineraryId = await Itinerary.create({
      touristId,
      title,
      description,
      startDate: startDate || null,
      endDate: endDate || null
    });

    const newItinerary = await Itinerary.findById(itineraryId);

    res.status(201).json({
      status: 'success',
      data: { itinerary: newItinerary }
    });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error creating itinerary.'
    });
  }
};

const getMyItineraries = async (req, res) => {
  try {
    const touristId = req.user.id;
    const itineraries = await Itinerary.findByTouristId(touristId);

    res.status(200).json({
      status: 'success',
      results: itineraries.length,
      data: { itineraries }
    });
  } catch (error) {
    console.error('Error getting itineraries:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving itineraries.'
    });
  }
};

const updateItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate } = req.body;
    const userId = req.user.id;

    const existingItinerary = await Itinerary.findById(id);
    if (!existingItinerary) {
      return res.status(404).json({
        status: 'fail',
        message: 'No itinerary found with that ID.'
      });
    }

    // Auth check
    if (existingItinerary.tourist_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this itinerary.'
      });
    }

    const updated = await Itinerary.update(id, { title, description, startDate, endDate });
    if (!updated) {
      return res.status(400).json({
        status: 'fail',
        message: 'No changes were made or update failed.'
      });
    }

    const updatedItinerary = await Itinerary.findById(id);

    res.status(200).json({
      status: 'success',
      data: { itinerary: updatedItinerary }
    });
  } catch (error) {
    console.error('Error updating itinerary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error updating itinerary.'
    });
  }
};

const deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingItinerary = await Itinerary.findById(id);
    if (!existingItinerary) {
      return res.status(404).json({
        status: 'fail',
        message: 'No itinerary found with that ID.'
      });
    }

    // Auth check
    if (existingItinerary.tourist_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this itinerary.'
      });
    }

    await Itinerary.delete(id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error deleting itinerary.'
    });
  }
};

module.exports = {
  createItinerary,
  getMyItineraries,
  updateItinerary,
  deleteItinerary
};
