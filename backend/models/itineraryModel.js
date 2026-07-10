const { pool } = require('../config/db');

class Itinerary {
  static async create({ touristId, title, description, startDate, endDate }) {
    const query = 'INSERT INTO itinerary (tourist_id, title, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(query, [touristId, title, description, startDate, endDate]);
    return result.insertId;
  }

  static async findByTouristId(touristId) {
    const query = 'SELECT * FROM itinerary WHERE tourist_id = ? ORDER BY start_date ASC';
    const [rows] = await pool.execute(query, [touristId]);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM itinerary WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async update(id, { title, description, startDate, endDate }) {
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }
    if (startDate !== undefined) {
      fields.push('start_date = ?');
      values.push(startDate);
    }
    if (endDate !== undefined) {
      fields.push('end_date = ?');
      values.push(endDate);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE itinerary SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM itinerary WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Itinerary;
