const Link = require('../models/Link');
const Profile = require('../models/Profile');
const AnalyticsLog = require('../models/AnalyticsLog');
const UAParser = require('ua-parser-js');

// @desc    Add a new link
// @route   POST /api/links
// @access  Private
const addLink = async (req, res, next) => {
  const { title, url, order } = req.body;

  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      res.status(404);
      throw new Error('Please create a profile first');
    }

    // Check Plan Limits (Free: 5 links max)
    const linkCount = await Link.countDocuments({ profile: profile._id });
    if (req.user.plan === 'free' && linkCount >= 5) {
      res.status(403);
      throw new Error('Free plan limit reached (max 5 links). Please upgrade to Pro.');
    }

    // Auto-calculate order if not provided
    let finalOrder = order;
    if (finalOrder === undefined) {
      const maxOrderLink = await Link.findOne({ profile: profile._id }).sort('-order');
      finalOrder = maxOrderLink ? maxOrderLink.order + 1 : 0;
    }

    const link = await Link.create({
      profile: profile._id,
      title,
      url,
      order: finalOrder,
    });

    res.status(201).json(link);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all links for a profile (public or private)
// @route   GET /api/links/:profileId
// @access  Public
const getLinks = async (req, res, next) => {
  try {
    const links = await Link.find({ profile: req.params.profileId, isActive: true }).sort('order');
    res.json(links);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all OWN links (including inactive)
// @route   GET /api/links/me
// @access  Private
const getMyLinks = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.json([]);
    }

    const links = await Link.find({ profile: profile._id }).sort('order');
    res.json(links);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a link
// @route   PUT /api/links/:id
// @access  Private
const updateLink = async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id);

    if (!link) {
      res.status(404);
      throw new Error('Link not found');
    }

    // Verify ownership
    const profile = await Profile.findOne({ user: req.user.id });
    if (link.profile.toString() !== profile._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const updatedLink = await Link.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedLink);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle link active status
// @route   PATCH /api/links/:id/toggle
// @access  Private
const toggleLink = async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id);

    if (!link) {
      res.status(404);
      throw new Error('Link not found');
    }

    const profile = await Profile.findOne({ user: req.user.id });
    if (link.profile.toString() !== profile._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }

    link.isActive = !link.isActive;
    await link.save();

    res.json(link);
  } catch (error) {
    next(error);
  }
};

// @desc    Increment click count
// @route   PATCH /api/links/:id/click
// @access  Public
const clickLink = async (req, res, next) => {
  try {
    const link = await Link.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!link) {
      res.status(404);
      throw new Error('Link not found');
    }

    // Log the click in the background
    const ua = new UAParser(req.headers['user-agent']).getResult();
    await AnalyticsLog.create({
      profile: link.profile,
      type: 'click',
      link: link._id,
      referrer: req.headers.referrer || req.headers.referer || 'Direct',
      device: ua.device.type || 'desktop',
      browser: ua.browser.name || 'Unknown',
      os: ua.os.name || 'Unknown',
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a link
// @route   DELETE /api/links/:id
// @access  Private
const deleteLink = async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id);

    if (!link) {
      res.status(404);
      throw new Error('Link not found');
    }

    const profile = await Profile.findOne({ user: req.user.id });
    if (link.profile.toString() !== profile._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }

    await link.deleteOne();
    res.json({ message: 'Link removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder links
// @route   POST /api/links/reorder
// @access  Private
const reorderLinks = async (req, res, next) => {
  const { links } = req.body; // Array of { _id, order }

  try {
    const bulkOps = links.map((link) => ({
      updateOne: {
        filter: { _id: link._id },
        update: { $set: { order: link.order } },
      },
    }));

    await Link.bulkWrite(bulkOps);
    res.json({ message: 'Links reordered successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addLink,
  getLinks,
  getMyLinks,
  updateLink,
  toggleLink,
  clickLink,
  deleteLink,
  reorderLinks,
};
