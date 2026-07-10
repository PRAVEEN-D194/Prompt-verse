const { pool } = require('../config/db');

class Review {
  static async create({ userId, placeId, hotelId, rating, comment }) {
    const query = 'INSERT INTO reviews (user_id, place_id, hotel_id, rating, comment) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(query, [userId, placeId, hotelId, rating, comment]);
    return result.insertId;
  }

  static async findByPlaceId(placeId) {
    const query = `
      SELECT r.*, u.username 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.place_id = ? 
      ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.execute(query, [placeId]);
    return rows;
  }

  static async findByHotelId(hotelId) {
    const query = `
      SELECT r.*, u.username 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.hotel_id = ? 
      ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.execute(query, [hotelId]);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM reviews WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async delete(id) {
    const query = 'DELETE FROM reviews WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Review;
