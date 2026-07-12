const TouristPlace = require('../models/touristPlaceModel');

const createPlace = async (req, res) => {
  try {
    const { name, description, location, category } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name and location are required.'
      });
    }

    const placeId = await TouristPlace.create({ name, description, location, category });
    const newPlace = await TouristPlace.findById(placeId);

    res.status(201).json({
      status: 'success',
      data: { place: newPlace }
    });
  } catch (error) {
    console.error('Error creating place:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error creating tourist place.'
    });
  }
};

const getAllPlaces = async (req, res) => {

  try {
    // const { category, search } = req.query;
    const places = await TouristPlace.findAll({});


    res.status(200).json({
      status: 'success',
      results: places.length,
      data: places
    });
  } catch (error) {
    console.error('Error getting places:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving tourist places.'
    });
  }
};

const getPlaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await TouristPlace.findById(id);

    if (!place) {
      return res.status(404).json({
        status: 'fail',
        message: 'No tourist place found with that ID.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { place }
    });
  } catch (error) {
    console.error('Error getting place by id:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving tourist place details.'
    });
  }
};

const updatePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, category } = req.body;

    const existingPlace = await TouristPlace.findById(id);
    if (!existingPlace) {
      return res.status(404).json({
        status: 'fail',
        message: 'No tourist place found with that ID.'
      });
    }

    const updated = await TouristPlace.update(id, { name, description, location, category });
    if (!updated) {
      return res.status(400).json({
        status: 'fail',
        message: 'No changes made or update failed.'
      });
    }

    const updatedPlace = await TouristPlace.findById(id);
    res.status(200).json({
      status: 'success',
      data: { place: updatedPlace }
    });
  } catch (error) {
    console.error('Error updating place:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error updating tourist place.'
    });
  }
};

const deletePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TouristPlace.delete(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'fail',
        message: 'No tourist place found with that ID.'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error deleting tourist place.'
    });
  }
};

module.exports = {
  createPlace,
  getAllPlaces,
  getPlaceById,
  updatePlace,
  deletePlace
};
