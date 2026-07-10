const { pool } = require('../config/db');

class User {
  /**
   * Find a user by their email address.
   * @param {string} email 
   * @returns {Object|null} The user object or null if not found
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  }

  /**
   * Find a user by their user ID.
   * @param {number} id 
   * @returns {Object|null} The user object (excluding password_hash) or null if not found
   */
  static async findById(id) {
    const query = 'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  /**
   * Create a new user in the database.
   * @param {Object} userData 
   * @param {string} userData.username
   * @param {string} userData.email
   * @param {string} userData.passwordHash
   * @param {string} userData.role
   * @returns {number} The newly inserted user's ID
   */
  static async create({ username, email, passwordHash, role }) {
    const query = 'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)';
    const [result] = await pool.execute(query, [username, email, passwordHash, role]);
    return result.insertId;
  }

  /**
   * Update user details.
   * @param {number} id
   * @param {Object} fieldsToUpdate
   * @returns {boolean} True if updated, false otherwise
   */
  static async update(id, { username, email, passwordHash }) {
    const fields = [];
    const values = [];

    if (username !== undefined) {
      fields.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email);
    }
    if (passwordHash !== undefined) {
      fields.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }
}

module.exports = User;
