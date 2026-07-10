const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);

// Protected auth endpoints
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
