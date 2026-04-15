const express = require('express');
const router = express.Router();
const {
  addSubscriber,
  getMySubscribers,
} = require('../controllers/subscriberController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:profileId', addSubscriber);
router.get('/me', protect, getMySubscribers);

module.exports = router;
