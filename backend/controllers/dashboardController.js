const { pool } = require('../config/db');

const getAdminDashboard = async (req, res) => {
  try {
    // 1. Fetch counts of users grouped by role
    const usersQuery = 'SELECT role, COUNT(*) as count FROM users GROUP BY role';
    const [userRows] = await pool.execute(usersQuery);
    
    const userStats = { tourist: 0, hotel_owner: 0, admin: 0, total: 0 };
    userRows.forEach(row => {
      userStats[row.role] = row.count;
      userStats.total += row.count;
    });

    // 2. Fetch counts of hotels
    const hotelsQuery = 'SELECT COUNT(*) as count FROM hotels';
    const [hotelRows] = await pool.execute(hotelsQuery);
    const totalHotels = hotelRows[0].count;

    // 3. Fetch counts of tourist places
    const placesQuery = 'SELECT COUNT(*) as count FROM tourist_places';
    const [placesRows] = await pool.execute(placesQuery);
    const totalPlaces = placesRows[0].count;

    // 4. Fetch counts of bookings
    const bookingsQuery = 'SELECT COUNT(*) as count FROM bookings';
    const [bookingsRows] = await pool.execute(bookingsQuery);
    const totalBookings = bookingsRows[0].count;

    // 5. Fetch recent 5 bookings with names
    const recentBookingsQuery = `
      SELECT b.id, b.total_price, b.status, b.created_at, u.username as tourist_name, h.name as hotel_name, r.room_type 
      FROM bookings b 
      JOIN users u ON b.tourist_id = u.id 
      JOIN hotel_rooms r ON b.room_id = r.id 
      JOIN hotels h ON r.hotel_id = h.id 
      ORDER BY b.created_at DESC 
      LIMIT 5
    `;
    const [recentBookings] = await pool.execute(recentBookingsQuery);

    // 6. Fetch analytics details (average ratings, booking status splits, total revenue)
    const avgHotelRatingQuery = 'SELECT AVG(rating) as avgRating FROM hotels';
    const [avgHotelRatingRows] = await pool.execute(avgHotelRatingQuery);
    const averageHotelRating = parseFloat(avgHotelRatingRows[0].avgRating || 0).toFixed(2);

    const avgPlaceRatingQuery = 'SELECT AVG(average_rating) as avgRating FROM tourist_places';
    const [avgPlaceRatingRows] = await pool.execute(avgPlaceRatingQuery);
    const averagePlaceRating = parseFloat(avgPlaceRatingRows[0].avgRating || 0).toFixed(2);

    const totalRevenueQuery = "SELECT SUM(total_price) as total FROM bookings WHERE status IN ('confirmed', 'completed')";
    const [revenueRows] = await pool.execute(totalRevenueQuery);
    const totalRevenue = parseFloat(revenueRows[0].total || 0).toFixed(2);

    const bookingStatusQuery = 'SELECT status, COUNT(*) as count FROM bookings GROUP BY status';
    const [statusRows] = await pool.execute(bookingStatusQuery);
    const bookingStatusDistribution = {};
    statusRows.forEach(row => {
      bookingStatusDistribution[row.status] = row.count;
    });

    res.status(200).json({
      status: 'success',
      data: {
        counts: {
          users: userStats,
          hotels: totalHotels,
          places: totalPlaces,
          bookings: totalBookings
        },
        recentBookings,
        analytics: {
          averageHotelRating,
          averagePlaceRating,
          totalRevenue,
          bookingStatusDistribution
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error gathering admin dashboard statistics.'
    });
  }
};

module.exports = {
  getAdminDashboard
};
