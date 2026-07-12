const Booking = require('../models/bookingModel');
const Room = require('../models/roomModel');
const Hotel = require('../models/hotelModel');
const Notification = require('../models/notificationModel');

const bookRoom = async (req, res) => {
  console.log("hsade");
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;
    const touristId = req.user.id;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        status: 'fail',
        message: 'roomId, checkInDate, and checkOutDate are required.'
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        status: 'fail',
        message: 'No room found with that ID.'
      });
    }

    if (!room.is_available) {
      return res.status(400).json({
        status: 'fail',
        message: 'This room is currently marked as unavailable.'
      });
    }

    // Date validations
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        status: 'fail',
        message: 'Check-in date cannot be in the past.'
      });
    }

    if (start >= end) {
      return res.status(400).json({
        status: 'fail',
        message: 'Check-out date must be after check-in date.'
      });
    }

    // Check date overlaps
    const isAvailable = await Booking.checkAvailability(roomId, checkInDate, checkOutDate);
    if (!isAvailable) {
      return res.status(409).json({
        status: 'fail',
        message: 'The room is already booked for the selected dates.'
      });
    }

    // Calculate total price
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((end - start) / msPerDay);
    const totalPrice = room.price_per_night * nights;

    const bookingId = await Booking.create({
      touristId,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice
    });

    const newBooking = await Booking.findById(bookingId);

    // Create notifications for Booking Created
    try {
      await Promise.all([
        Notification.create({
          userId: touristId,
          title: "Booking Submitted",
          message: "Your booking request has been submitted successfully."
        }),
        Notification.create({
          userId: newBooking.hotel_owner_id,
          title: "New Booking Request",
          message: "A new booking request has been received."
        })
      ]);
    } catch (notifError) {
      console.error("Error creating notifications on bookRoom:", notifError);
    }

    res.status(201).json({
      status: 'success',
      data: { booking: newBooking }
    });
  } catch (error) {
    console.error('Error booking room:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error processing booking.'
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const touristId = req.user.id;
    const bookings = await Booking.findByTouristId(touristId);

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });
  } catch (error) {
    console.error('Error retrieving user bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving your bookings.'
    });
  }
};

const getHotelBookings = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

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
        message: 'You are not authorized to view bookings for this hotel.'
      });
    }

    const bookings = await Booking.findByHotelId(hotelId);

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });
  } catch (error) {
    console.error('Error retrieving hotel bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving hotel bookings.'
    });
  }
};

const createStatusNotifications = async (booking, status) => {
  try {
    const touristId = booking.tourist_id;
    const ownerId = booking.hotel_owner_id;

    if (status === 'confirmed') {
      await Promise.all([
        Notification.create({
          userId: touristId,
          title: "Booking Confirmed",
          message: "Your booking has been confirmed."
        }),
        Notification.create({
          userId: ownerId,
          title: "Booking Confirmed",
          message: "You confirmed the booking."
        })
      ]);
    } else if (status === 'completed') {
      await Promise.all([
        Notification.create({
          userId: touristId,
          title: "Booking Completed",
          message: "Your stay has been completed. You can now rate and review the hotel."
        }),
        Notification.create({
          userId: ownerId,
          title: "Booking Completed",
          message: "A guest has completed their stay."
        })
      ]);
    } else if (status === 'cancelled') {
      await Promise.all([
        Notification.create({
          userId: touristId,
          title: "Booking Cancelled",
          message: "Your booking has been cancelled."
        }),
        Notification.create({
          userId: ownerId,
          title: "Booking Cancelled",
          message: "A booking has been cancelled."
        })
      ]);
    }
  } catch (error) {
    console.error("Error creating status notifications:", error);
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid status: pending, confirmed, cancelled, or completed.'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID.'
      });
    }

    // Auth check: User must be Admin OR the actual hotel Owner
    if (userRole !== 'admin' && booking.hotel_owner_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update status for this booking.'
      });
    }

    const updated = await Booking.updateStatus(id, status);
    if (!updated) {
      return res.status(400).json({
        status: 'fail',
        message: 'No changes made or update failed.'
      });
    }

    const updatedBooking = await Booking.findById(id);

    // Trigger status update notifications
    await createStatusNotifications(booking, status);

    res.status(200).json({
      status: 'success',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error updating booking status.'
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID.'
      });
    }

    // Auth check: User must be Admin OR the tourist who booked OR the hotel Owner
    if (userRole !== 'admin' && booking.tourist_id !== userId && booking.hotel_owner_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to cancel this booking.'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        status: 'fail',
        message: 'This booking is already cancelled.'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        status: 'fail',
        message: 'Completed bookings cannot be cancelled.'
      });
    }

    const updated = await Booking.updateStatus(id, 'cancelled');
    if (!updated) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cancellation failed.'
      });
    }

    const cancelledBooking = await Booking.findById(id);

    // Trigger status update notifications
    await createStatusNotifications(booking, 'cancelled');

    res.status(200).json({
      status: 'success',
      data: { booking: cancelledBooking }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error cancelling booking.'
    });
  }
};

module.exports = {
  bookRoom,
  getMyBookings,
  getHotelBookings,
  updateBookingStatus,
  cancelBooking
};
