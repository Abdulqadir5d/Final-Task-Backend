const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a link title'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Please add a URL'],
    match: [
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      'Please add a valid URL',
    ],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Link', linkSchema);
