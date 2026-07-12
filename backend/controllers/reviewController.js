const { pool } = require('../config/db');
const Review = require('../models/reviewModel');
const TouristPlace = require('../models/touristPlaceModel');
const Hotel = require('../models/hotelModel');

const createReview = async (req, res) => {
  try {
    const { placeId, hotelId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'fail',
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    if (!placeId && !hotelId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide either a placeId or a hotelId for the review.'
      });
    }

    if (placeId && hotelId) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot submit a review for a place and a hotel simultaneously.'
      });
    }

    // Verify target existence
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

      // Check if tourist has a COMPLETED booking for this hotel
      const bookingQuery = `
        SELECT b.id 
        FROM bookings b 
        JOIN hotel_rooms r ON b.room_id = r.id 
        WHERE b.tourist_id = ? AND r.hotel_id = ? AND b.status = 'completed'
        LIMIT 1
      `;
      const [bookings] = await pool.execute(bookingQuery, [userId, hotelId]);
      if (bookings.length === 0) {
        return res.status(403).json({
          status: 'fail',
          message: 'You can only rate and review hotels you have stayed at.'
        });
      }

      // Check if user has already reviewed this hotel
      const existingReviewQuery = `
        SELECT id FROM reviews WHERE user_id = ? AND hotel_id = ? LIMIT 1
      `;
      const [existingReviews] = await pool.execute(existingReviewQuery, [userId, hotelId]);
      if (existingReviews.length > 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'You have already reviewed this hotel.'
        });
      }
    }

    const reviewId = await Review.create({
      userId,
      placeId: placeId || null,
      hotelId: hotelId || null,
      rating,
      comment
    });

    // Update aggregated rating columns in the respective tables
    if (placeId) {
      await TouristPlace.updateAverageRating(placeId);
    } else if (hotelId) {
      await Hotel.updateRating(hotelId);
    }

    const newReview = await Review.findById(reviewId);

    res.status(201).json({
      status: 'success',
      data: { review: newReview }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error submitting review.'
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const { placeId, hotelId } = req.query;

    if (!placeId && !hotelId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please specify placeId or hotelId in query parameters.'
      });
    }

    let reviews = [];
    if (placeId) {
      reviews = await Review.findByPlaceId(placeId);
    } else {
      reviews = await Review.findByHotelId(hotelId);
    }

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving reviews.'
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'No review found with that ID.'
      });
    }

    // Auth check: User must be Admin OR the user who posted the review
    if (userRole !== 'admin' && review.user_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this review.'
      });
    }

    const deleted = await Review.delete(id);
    if (!deleted) {
      return res.status(400).json({
        status: 'fail',
        message: 'Delete failed.'
      });
    }

    // Recalculate average ratings
    if (review.place_id) {
      await TouristPlace.updateAverageRating(review.place_id);
    } else if (review.hotel_id) {
      await Hotel.updateRating(review.hotel_id);
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error deleting review.'
    });
  }
};

module.exports = {
  createReview,
  getReviews,
  deleteReview
};
