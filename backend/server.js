const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS using environment variable
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Built-in body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder (MVC uploads setup)
app.use('/uploads', express.static('uploads'));

// Health check / API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'AI Smart Tourism Management System API is active',
    roles_supported: ['tourist', 'hotel_owner', 'admin'],
    timestamp: new Date()
  });
});

// Start the server and test database connectivity
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await testConnection();
});
