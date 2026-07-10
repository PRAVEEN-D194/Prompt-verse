const { pool } = require('../config/db');

class TouristPlace {
  static async create({ name, description, location, category }) {
    const query = 'INSERT INTO tourist_places (name, description, location, category) VALUES (?, ?, ?, ?)';
    const [result] = await pool.execute(query, [name, description, location, category]);
    return result.insertId;
  }

  static async findAll({ category, search } = {}) {
    let query = 'SELECT * FROM tourist_places';
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('(name LIKE ? OR location LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM tourist_places WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async update(id, { name, description, location, category }) {
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }
    if (location !== undefined) {
      fields.push('location = ?');
      values.push(location);
    }
    if (category !== undefined) {
      fields.push('category = ?');
      values.push(category);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE tourist_places SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM tourist_places WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async updateAverageRating(id) {
    const ratingQuery = 'SELECT AVG(rating) as avgRating FROM reviews WHERE place_id = ?';
    const [rows] = await pool.execute(ratingQuery, [id]);
    const averageRating = rows[0].avgRating || 0.00;

    const updateQuery = 'UPDATE tourist_places SET average_rating = ? WHERE id = ?';
    await pool.execute(updateQuery, [averageRating, id]);
    return averageRating;
  }
}

module.exports = TouristPlace;
