const { pool } = require('../config/db');

class Hotel {
  static async create({ ownerId, name, description, address, contactNumber }) {
    const query = 'INSERT INTO hotels (owner_id, name, description, address, contact_number) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(query, [ownerId, name, description, address, contactNumber]);
    return result.insertId;
  }

  static async findAll({ search } = {}) {
    let query = 'SELECT h.*, u.username as owner_name FROM hotels h JOIN users u ON h.owner_id = u.id';
    const params = [];

    if (search) {
      query += ' WHERE h.name LIKE ? OR h.address LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY h.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT h.*, u.username as owner_name FROM hotels h JOIN users u ON h.owner_id = u.id WHERE h.id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async update(id, { name, description, address, contactNumber }) {
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
    if (address !== undefined) {
      fields.push('address = ?');
      values.push(address);
    }
    if (contactNumber !== undefined) {
      fields.push('contact_number = ?');
      values.push(contactNumber);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE hotels SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM hotels WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async updateRating(id) {
    const ratingQuery = 'SELECT AVG(rating) as avgRating FROM reviews WHERE hotel_id = ?';
    const [rows] = await pool.execute(ratingQuery, [id]);
    const averageRating = rows[0].avgRating || 0.00;

    const updateQuery = 'UPDATE hotels SET rating = ? WHERE id = ?';
    await pool.execute(updateQuery, [averageRating, id]);
    return averageRating;
  }
}

module.exports = Hotel;
