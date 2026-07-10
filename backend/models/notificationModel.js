const { pool } = require('../config/db');

class Notification {
  static async create({ userId, title, message }) {
    const query = 'INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, ?)';
    const [result] = await pool.execute(query, [userId, title, message, 0]);
    return result.insertId;
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM notifications WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async markAsRead(id) {
    const query = 'UPDATE notifications SET is_read = 1 WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM notifications WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Notification;
