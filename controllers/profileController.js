const Profile = require('../models/Profile');
const User = require('../models/User');
const Link = require('../models/Link');
const AnalyticsLog = require('../models/AnalyticsLog');
const UAParser = require('ua-parser-js');

// @desc    Create or Update user profile
// @route   POST /api/profile
// @access  Private
const upsertProfile = async (req, res, next) => {
  const { username, fullName, bio, profileImage, theme, socials } = req.body;

  try {
    // Build profile object
    const profileFields = {
      user: req.user.id,
      username,
      fullName,
      bio,
      profileImage,
      theme,
      socials,
    };

    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Check if username changed and if new username is taken
      if (username && username !== profile.username) {
        const usernameExists = await Profile.findOne({ username });
        if (usernameExists) {
          res.status(400);
          throw new Error('Username already taken');
        }
      }

      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Check if username taken for new profile
    const usernameExists = await Profile.findOne({ username });
    if (usernameExists) {
      res.status(400);
      throw new Error('Username already taken');
    }

    // Create
    profile = new Profile(profileFields);
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    res.json(profile || null);
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch public profile by username
// @route   GET /api/profile/:username
// @access  Public
const getPublicProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username }).populate('user', 'plan');

    if (!profile) {
      res.status(404);
      throw new Error('Profile not found');
    }

    // Increment views safely in the background
    await Profile.findByIdAndUpdate(profile._id, { $inc: { views: 1 } });

    // Log the view in the background
    const ua = new UAParser(req.headers['user-agent']).getResult();
    await AnalyticsLog.create({
      profile: profile._id,
      type: 'view',
      referrer: req.headers.referrer || req.headers.referer || 'Direct',
      device: ua.device.type || 'desktop',
      browser: ua.browser.name || 'Unknown',
      os: ua.os.name || 'Unknown',
    });

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/profile/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.json({ views: 0, clicks: 0, topLinks: [] });
    }

    const links = await Link.find({ profile: profile._id });
    const totalClicks = links.reduce((acc, link) => acc + (link.clicks || 0), 0);
    
    // Get Logs for Charting (Last 1000 interactions)
    const logs = await AnalyticsLog.find({ profile: profile._id }).limit(1000);
    
    // Aggregate Device Data
    const deviceStats = logs.reduce((acc, log) => {
      acc[log.device] = (acc[log.device] || 0) + 1;
      return acc;
    }, {});

    // Aggregate Referrer Data
    const referrerStats = logs.reduce((acc, log) => {
      // Simplify referrers (Social names)
      let ref = log.referrer.toLowerCase();
      if (ref.includes('instagram')) ref = 'Instagram';
      else if (ref.includes('t.co') || ref.includes('twitter')) ref = 'Twitter';
      else if (ref.includes('tiktok')) ref = 'TikTok';
      else if (ref.includes('linkedin')) ref = 'LinkedIn';
      else if (ref === 'direct') ref = 'Direct';
      else ref = 'Other';
      
      acc[ref] = (acc[ref] || 0) + 1;
      return acc;
    }, {});

    // Get top 3 links
    const topLinks = [...links]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 3)
      .map(l => ({ title: l.title, clicks: l.clicks }));

    res.json({
      views: profile.views || 0,
      clicks: totalClicks,
      topLinks,
      devices: Object.entries(deviceStats).map(([name, value]) => ({ name, value })),
      sources: Object.entries(referrerStats).map(([name, value]) => ({ name, value }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upsertProfile,
  getMyProfile,
  getPublicProfile,
  getDashboardStats,
};
