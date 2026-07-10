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

// Auth routes registration
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Resource routes registration
const touristPlaceRoutes = require('./routes/touristPlaceRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/places', touristPlaceRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);


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
