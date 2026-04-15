const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  fullName: {
    type: String,
    required: [true, 'Please add a full name'],
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot be more than 200 characters'],
  },
  profileImage: {
    type: String,
    default: '',
  },
  views: {
    type: Number,
    default: 0,
  },
  theme: {
    type: String,
    default: 'dark', // Options: light, dark, neon, glass
  },
  socials: {
    instagram: String,
    twitter: String,
    linkedin: String,
    github: String,
    youtube: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Profile', profileSchema);
