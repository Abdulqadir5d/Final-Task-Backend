const Subscriber = require('../models/Subscriber');
const Profile = require('../models/Profile');

// @desc    Add a new subscriber to a profile
// @route   POST /api/subscribers/:profileId
// @access  Public
const addSubscriber = async (req, res, next) => {
  const { email } = req.body;
  const { profileId } = req.params;

  try {
    const profile = await Profile.findById(profileId);
    if (!profile) {
      res.status(404);
      throw new Error('Profile not found');
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ profile: profileId, email: email.toLowerCase() });
    if (existing) {
      res.status(400);
      throw new Error('Already subscribed to this node');
    }

    const subscriber = await Subscriber.create({
      profile: profileId,
      email: email.toLowerCase(),
    });

    res.status(201).json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subscribers for own profile
// @route   GET /api/subscribers/me
// @access  Private
const getMySubscribers = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.json([]);
    }

    const subscribers = await Subscriber.find({ profile: profile._id }).sort('-createdAt');
    res.json(subscribers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addSubscriber,
  getMySubscribers,
};
