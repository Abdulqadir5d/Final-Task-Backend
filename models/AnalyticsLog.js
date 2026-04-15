const mongoose = require('mongoose');

const analyticsLogSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  type: {
    type: String,
    enum: ['view', 'click'],
    required: true,
  },
  link: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
  },
  referrer: {
    type: String,
    default: 'Direct',
  },
  device: {
    type: String,
    default: 'Unknown',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  os: {
    type: String,
    default: 'Unknown',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AnalyticsLog', analyticsLogSchema);
