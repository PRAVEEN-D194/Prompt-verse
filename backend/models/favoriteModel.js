const { pool } = require('../config/db');

class Favorite {
  static async create({ userId, placeId, hotelId }) {
    const query = 'INSERT INTO favorites (user_id, place_id, hotel_id) VALUES (?, ?, ?)';
    const [result] = await pool.execute(query, [userId, placeId, hotelId]);
    return result.insertId;
  }

  static async findByUserId(userId) {
    const query = `
      SELECT f.id, f.created_at,
             tp.id as place_id, tp.name as place_name, tp.location as place_location, tp.category as place_category,
             h.id as hotel_id, h.name as hotel_name, h.address as hotel_address, h.rating as hotel_rating
      FROM favorites f
      LEFT JOIN tourist_places tp ON f.place_id = tp.id
      LEFT JOIN hotels h ON f.hotel_id = h.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM favorites WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async delete(id) {
    const query = 'DELETE FROM favorites WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async checkDuplicate({ userId, placeId, hotelId }) {
    let query = 'SELECT * FROM favorites WHERE user_id = ? AND ';
    const params = [userId];

    if (placeId) {
      query += 'place_id = ?';
      params.push(placeId);
    } else if (hotelId) {
      query += 'hotel_id = ?';
      params.push(hotelId);
    } else {
      return false;
    }

    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  }
}

module.exports = Favorite;
