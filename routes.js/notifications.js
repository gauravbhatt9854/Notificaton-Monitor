import express from 'express';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();

// 🔹 Get all notifications for a user
router.get('/notifications/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 9, start, end, package: pkg } = req.query;

    // safer parsing without changing API behavior
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 9;

    const user = await User.findOne({ username }).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const query = { user: user._id };

    // date filters
    if (start || end) {
      query.timestamp = {};

      if (start) {
        query.timestamp.$gte = new Date(start);
      }

      if (end) {
        query.timestamp.$lte = new Date(end);
      }
    }

    // package filter
    if (pkg) {
      query.package = pkg;
    }

    // run queries in parallel for better performance
    const [total, notifications, allPackages] = await Promise.all([
      Notification.countDocuments(query),

      Notification.find(query)
        .sort({ timestamp: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('user', 'username')
        .lean(),

      Notification.distinct('package', { user: user._id })
    ]);

    // EXACT SAME response structure
    res.json({
      notifications,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      allPackages
    });

  } catch (err) {
    console.error('❌ Error fetching notifications:', err);

    res.status(500).json({
      error: 'Internal error'
    });
  }
});

export default router;
