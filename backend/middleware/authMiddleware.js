const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Route protection middleware to authenticate user via JWT.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header for Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired token. Please log in again.'
      });
    }

    // Check if user still exists in database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Grant access to protected route by attaching user info to request context
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal authentication server error.'
    });
  }
};

/**
 * Authorization middleware to restrict routes to specific roles (e.g., admin, hotel_owner).
 * @param {...string} roles - The list of permitted roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is attached by 'protect' middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
