const express = require('express');
const { getAdminDashboard } = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin-only dashboard statistics
router.get('/', protect, restrictTo('admin'), getAdminDashboard);

module.exports = router;
