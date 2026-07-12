const mysql = require('mysql2/promise');
require('dotenv').config();

// Create the connection pool using environment variables
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'praveen12321',
  database: 'ai_smart_tourism_db',
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
    console.log({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'YOUR_PASSWORD',
  database: 'ai_smart_tourism_db'
});
    console.error(error.message);
  }
};

// Expose pool and test utility
module.exports = {
  pool,
  testConnection
};
