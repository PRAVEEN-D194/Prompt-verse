const Hotel = require('../models/hotelModel');

const createHotel = async (req, res) => {
  try {
    const { name, description, address, contactNumber } = req.body;
    const ownerId = req.user.id; // From protect middleware

    if (!name || !address) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name and address are required.'
      });
    }

    const hotelId = await Hotel.create({ ownerId, name, description, address, contactNumber });
    const newHotel = await Hotel.findById(hotelId);

    res.status(201).json({
      status: 'success',
      data: { hotel: newHotel }
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error creating hotel.'
    });
  }
};

const getAllHotels = async (req, res) => {
  try {
    const { search } = req.query;
    const hotels = await Hotel.findAll({ search });

    res.status(200).json({
      status: 'success',
      results: hotels.length,
      data: { hotels }
    });
  } catch (error) {
    console.error('Error getting hotels:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving hotels.'
    });
  }
};

const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        status: 'fail',
        message: 'No hotel found with that ID.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { hotel }
    });
  } catch (error) {
    console.error('Error getting hotel by id:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving hotel details.'
    });
  }
};

const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address, contactNumber } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const existingHotel = await Hotel.findById(id);
    if (!existingHotel) {
      return res.status(404).json({
        status: 'fail',
        message: 'No hotel found with that ID.'
      });
    }

    // Authorization check: User must be Admin OR the actual hotel Owner
    if (userRole !== 'admin' && existingHotel.owner_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this hotel profile.'
      });
    }

    const updated = await Hotel.update(id, { name, description, address, contactNumber });
    if (!updated) {
      return res.status(400).json({
        status: 'fail',
        message: 'No changes were made or update failed.'
      });
    }

    const updatedHotel = await Hotel.findById(id);
    res.status(200).json({
      status: 'success',
      data: { hotel: updatedHotel }
    });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error updating hotel.'
    });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const existingHotel = await Hotel.findById(id);
    if (!existingHotel) {
      return res.status(404).json({
        status: 'fail',
        message: 'No hotel found with that ID.'
      });
    }

    // Authorization check: User must be Admin OR the actual hotel Owner
    if (userRole !== 'admin' && existingHotel.owner_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this hotel.'
      });
    }

    const deleted = await Hotel.delete(id);
    if (!deleted) {
      return res.status(400).json({
        status: 'fail',
        message: 'Delete failed.'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error deleting hotel.'
    });
  }
};

module.exports = {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel
};
