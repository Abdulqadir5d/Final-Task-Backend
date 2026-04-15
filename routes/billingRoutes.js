const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  handleWebhook,
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout', protect, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
