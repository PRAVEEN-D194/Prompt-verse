const Notification = require('../models/notificationModel');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findByUserId(userId);

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: { notifications }
    });
  } catch (error) {
    console.error('Error retrieving notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving notifications.'
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        status: 'fail',
        message: 'No notification found with that ID.'
      });
    }

    // Auth check
    if (notification.user_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to mark this notification as read.'
      });
    }

    const updated = await Notification.markAsRead(id);
    if (!updated) {
      return res.status(400).json({
        status: 'fail',
        message: 'Already read or update failed.'
      });
    }

    const updatedNotification = await Notification.findById(id);

    res.status(200).json({
      status: 'success',
      data: { notification: updatedNotification }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error updating notification.'
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        status: 'fail',
        message: 'No notification found with that ID.'
      });
    }

    // Auth check
    if (notification.user_id !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this notification.'
      });
    }

    await Notification.delete(id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error deleting notification.'
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification
};
