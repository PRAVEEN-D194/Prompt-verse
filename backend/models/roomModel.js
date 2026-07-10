const { pool } = require('../config/db');

class Room {
  static async create({ hotelId, roomType, pricePerNight, capacity, isAvailable = true }) {
    const query = 'INSERT INTO hotel_rooms (hotel_id, room_type, price_per_night, capacity, is_available) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(query, [hotelId, roomType, pricePerNight, capacity, isAvailable]);
    return result.insertId;
  }

  static async findByHotelId(hotelId) {
    const query = 'SELECT * FROM hotel_rooms WHERE hotel_id = ? ORDER BY price_per_night ASC';
    const [rows] = await pool.execute(query, [hotelId]);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT r.*, h.owner_id FROM hotel_rooms r JOIN hotels h ON r.hotel_id = h.id WHERE r.id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async update(id, { roomType, pricePerNight, capacity, isAvailable }) {
    const fields = [];
    const values = [];

    if (roomType !== undefined) {
      fields.push('room_type = ?');
      values.push(roomType);
    }
    if (pricePerNight !== undefined) {
      fields.push('price_per_night = ?');
      values.push(pricePerNight);
    }
    if (capacity !== undefined) {
      fields.push('capacity = ?');
      values.push(capacity);
    }
    if (isAvailable !== undefined) {
      fields.push('is_available = ?');
      values.push(isAvailable ? 1 : 0);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE hotel_rooms SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM hotel_rooms WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Room;
