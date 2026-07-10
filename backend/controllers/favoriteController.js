const Favorite = require('../models/favoriteModel');
const TouristPlace = require('../models/touristPlaceModel');
const Hotel = require('../models/hotelModel');

const addFavorite = async (req, res) => {
  try {
    const { placeId, hotelId } = req.body;
    const userId = req.user.id;

    if (!placeId && !hotelId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide either a placeId or a hotelId to favorite.'
      });
    }

    if (placeId && hotelId) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot favorite a place and a hotel in the same transaction.'
      });
    }

    // Verify existence
    if (placeId) {
      const place = await TouristPlace.findById(placeId);
      if (!place) {
        return res.status(404).json({
          status: 'fail',
          message: 'No tourist place found with that ID.'
        });
      }
    } else {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({
          status: 'fail',
          message: 'No hotel found with that ID.'
        });
      }
    }

    // Check duplicate
    const isDuplicate = await Favorite.checkDuplicate({ userId, placeId, hotelId });
    if (isDuplicate) {
      return res.status(409).json({
        status: 'fail',
        message: 'This item is already in your favorites list.'
      });
    }

    const favoriteId = await Favorite.create({
      userId,
      placeId: placeId || null,
      hotelId: hotelId || null
    });

    const newFavorite = await Favorite.findById(favoriteId);

    res.status(201).json({
      status: 'success',
      data: { favorite: newFavorite }
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error adding to favorites.'
    });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.findByUserId(userId);

    res.status(200).json({
      status: 'success',
      results: favorites.length,
      data: { favorites }
    });
  } catch (error) {
    console.error('Error retrieving favorites:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving favorites.'
    });
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findById(id);
    if (!favorite) {
      return res.status(404).json({
        status: 'fail',
        message: 'No favorite entry found with that ID.'
      });
    }

    // Auth check
    if (favorite.user_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to remove this favorite entry.'
      });
    }

    await Favorite.delete(id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error removing favorite.'
    });
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  deleteFavorite
};
