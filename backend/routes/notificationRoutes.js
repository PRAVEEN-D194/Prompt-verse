const express = require('express');
const {
  getNotifications,
  markAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All notifications routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
