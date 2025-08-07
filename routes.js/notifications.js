import express from 'express';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();

// 🔹 For basic test notifications (no user)
router.post('/receive-notification', (req, res) => {
  const { package: pkg, title, text } = req.body;

  console.log("📩 New Notification Received:");
  console.log(`📦 App Package: ${pkg}`);
  console.log(`📝 Title: ${title}`);
  console.log(`🔔 Text: ${text}`);
  console.log('------------------------------');

  res.status(200).send('Notification received!');
});

// 🔹 Save user-specific notification
router.post('/receive-notification-user', async (req, res) => {
  try {
    const { username, package: pkg, title, text } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const notification = new Notification({
      user: user._id,
      package: pkg,
      title,
      text
    });

    await notification.save();
    console.log("✅ Notification saved from:", username, "| Text:", text);
    res.status(201).json({ message: 'Notification saved successfully' });
  } catch (error) {
    console.error('❌ Error saving notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🔹 Get all notifications for a user
router.get('/notifications/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 9, start, end, package: pkg } = req.query;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const query = { user: user._id };
    if (start || end) {
      query.timestamp = {};
      if (start) query.timestamp.$gte = new Date(start);
      if (end) query.timestamp.$lte = new Date(end);
    }
    if (pkg) query.package = pkg;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'username'); // optional: populate username in results

    const allPackages = await Notification.distinct("package", { user: user._id });

    res.json({
      notifications,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      allPackages
    });
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;