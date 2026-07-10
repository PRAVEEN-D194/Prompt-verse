const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Sign JWT Token Helper
 * @param {number} id - User ID
 * @returns {string} Signed JWT Token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * User Registration Handler
 */
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 1. Basic validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide username, email, password, and role.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid email address.'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Validate role definition
    const validRoles = ['tourist', 'hotel_owner', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid role selection. Must be either tourist, hotel_owner, or admin.'
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'A user with this email address already exists.'
      });
    }

    // 3. Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Create user in database
    const newUserId = await User.create({
      username,
      email,
      passwordHash,
      role
    });

    // 5. Generate token and return success response
    const token = signToken(newUserId);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUserId,
          username,
          email,
          role
        }
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during registration.'
    });
  }
};

/**
 * User Login Handler
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password.'
      });
    }

    // 2. Find user in the database
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password.'
      });
    }

    // 3. Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password.'
      });
    }

    // 4. Generate token and send response
    const token = signToken(user.id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during login.'
    });
  }
};

/**
 * Get Authenticated User Profile Handler
 */
const getProfile = async (req, res) => {
  try {
    // req.user is already populated by 'protect' middleware
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving user profile.'
    });
  }
};

/**
 * Update Authenticated User Profile Handler
 */
const updateProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please provide a valid email address.'
        });
      }
      
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          status: 'fail',
          message: 'A user with this email address already exists.'
        });
      }
      updateData.email = email;
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({
          status: 'fail',
          message: 'Password must be at least 6 characters long.'
        });
      }
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide at least one field to update.'
      });
    }

    const isUpdated = await User.update(userId, updateData);
    if (!isUpdated) {
      return res.status(400).json({
        status: 'fail',
        message: 'No changes were made or update failed.'
      });
    }

    const updatedUser = await User.findById(userId);
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error updating profile.'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
