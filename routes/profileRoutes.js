const express = require('express');
const router = express.Router();
const {
  upsertProfile,
  getMyProfile,
  getPublicProfile,
  getDashboardStats,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, upsertProfile);
router.get('/me', protect, getMyProfile);
router.get('/stats', protect, getDashboardStats);
router.get('/:username', getPublicProfile);

module.exports = router;
