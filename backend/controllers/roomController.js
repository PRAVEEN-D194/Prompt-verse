const Room = require('../models/roomModel');
const Hotel = require('../models/hotelModel');

const createRoom = async (req, res) => {
  try {
    const { hotelId, roomType, pricePerNight, capacity } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!hotelId || !roomType || !pricePerNight || !capacity) {
      return res.status(400).json({
        status: 'fail',
        message: 'hotelId, roomType, pricePerNight, and capacity are required.'
      });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        status: 'fail',
        message: 'No hotel found with that ID.'
      });
    }

    // Auth check: User must be Admin OR the actual hotel Owner
    if (userRole !== 'admin' && hotel.owner_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add rooms to this hotel.'
      });
    }

    const roomId = await Room.create({ hotelId, roomType, pricePerNight, capacity });
    const newRoom = await Room.findById(roomId);

    res.status(201).json({
      status: 'success',
      data: { room: newRoom }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error creating room.'
    });
  }
};

const getRooms = async (req, res) => {
  console.log("hjwer");
  try {
    const { hotelId } = req.params;
    console.log(hotelId);
    if (!hotelId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a hotel ID.'
      });
    }

    const rooms = await Room.findByHotelId(hotelId);

    res.status(200).json({
      status: 'success',
      results: rooms.length,
      data: { rooms }
    });
  } catch (error) {
    console.error('Error getting rooms:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving rooms.'
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomType, pricePerNight, capacity, isAvailable } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const existingRoom = await Room.findById(id);
    if (!existingRoom) {
      return res.status(404).json({
        status: 'fail',
        message: 'No room found with that ID.'
      });
    }

    // Auth check: User must be Admin OR the actual hotel Owner
    if (userRole !== 'admin' && existingRoom.owner_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update details for this room.'
      });
    }

    const updated = await Room.update(id, { roomType, pricePerNight, capacity, isAvailable });
    if (!updated) {
      return res.status(400).json({
        status: 'fail',
        message: 'No changes made or update failed.'
      });
    }

    const updatedRoom = await Room.findById(id);
    res.status(200).json({
      status: 'success',
      data: { room: updatedRoom }
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error updating room.'
    });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const existingRoom = await Room.findById(id);
    if (!existingRoom) {
      return res.status(404).json({
        status: 'fail',
        message: 'No room found with that ID.'
      });
    }

    // Auth check: User must be Admin OR the actual hotel Owner
    if (userRole !== 'admin' && existingRoom.owner_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this room.'
      });
    }

    const deleted = await Room.delete(id);
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
    console.error('Error deleting room:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error deleting room.'
    });
  }
};

module.exports = {
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom
};
