const express = require('express');
const {
  addFavorite,
  getFavorites,
  deleteFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All favorites routes require authentication
router.use(protect);

router.post('/', addFavorite);
router.get('/', getFavorites);
router.delete('/:id', deleteFavorite);

module.exports = router;
