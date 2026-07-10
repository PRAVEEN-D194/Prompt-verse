const mysql = require('mysql2/promise');
require('dotenv').config();

// Create the connection pool using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_smart_tourism_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to test the connection pool on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL Database Connected Successfully!');
    connection.release();
  } catch (error) {
    console.error('Database connection failed! Details:', error.message);
  }
};

// Expose pool and test utility
module.exports = {
  pool,
  testConnection
};
