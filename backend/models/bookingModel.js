const { pool } = require('../config/db');

class Booking {
  static async create({ touristId, roomId, checkInDate, checkOutDate, totalPrice }) {
    const query = 'INSERT INTO bookings (tourist_id, room_id, check_in_date, check_out_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await pool.execute(query, [touristId, roomId, checkInDate, checkOutDate, totalPrice, 'pending']);
    return result.insertId;
  }

  static async findByTouristId(touristId) {
    const query = `
      SELECT b.*, r.room_type, r.price_per_night, h.name as hotel_name, h.address as hotel_address 
      FROM bookings b 
      JOIN hotel_rooms r ON b.room_id = r.id 
      JOIN hotels h ON r.hotel_id = h.id 
      WHERE b.tourist_id = ? 
      ORDER BY b.created_at DESC
    `;
    const [rows] = await pool.execute(query, [touristId]);
    return rows;
  }

  static async findByHotelId(hotelId) {
    const query = `
      SELECT b.*, r.room_type, u.username as tourist_name, u.email as tourist_email 
      FROM bookings b 
      JOIN hotel_rooms r ON b.room_id = r.id 
      JOIN users u ON b.tourist_id = u.id 
      WHERE r.hotel_id = ? 
      ORDER BY b.created_at DESC
    `;
    const [rows] = await pool.execute(query, [hotelId]);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT b.*, r.room_type, r.price_per_night, h.id as hotel_id, h.name as hotel_name, h.owner_id as hotel_owner_id, u.username as tourist_name
      FROM bookings b 
      JOIN hotel_rooms r ON b.room_id = r.id 
      JOIN hotels h ON r.hotel_id = h.id 
      JOIN users u ON b.tourist_id = u.id
      WHERE b.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE bookings SET status = ? WHERE id = ?';
    const [result] = await pool.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  static async checkAvailability(roomId, checkInDate, checkOutDate) {
    const query = `
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE room_id = ? 
      AND status != 'cancelled' 
      AND (
        (check_in_date <= ? AND check_out_date >= ?) OR
        (check_in_date <= ? AND check_out_date >= ?) OR
        (? <= check_in_date AND ? >= check_out_date)
      )
    `;
    const [rows] = await pool.execute(query, [
      roomId,
      checkInDate, checkInDate,
      checkOutDate, checkOutDate,
      checkInDate, checkOutDate
    ]);
    return rows[0].count === 0;
  }
}

module.exports = Booking;
