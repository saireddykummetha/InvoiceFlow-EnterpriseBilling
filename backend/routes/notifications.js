const express = require('express');
const { protect } = require('../middleware/auth');
const { Notification } = require('../models');

const router = express.Router();

// GET /api/notifications/
router.get(['/', ''], protect, async (req, res) => {
  try {
    const list = await Notification.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/
router.patch(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const n = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { returnDocument: 'after' });
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

// POST /api/notifications/mark-all-read/
router.post(['/mark-all-read', '/mark-all-read/'], protect, async (req, res) => {
  try {
    await Notification.updateMany({}, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// DELETE /api/notifications/:id/
router.delete(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

module.exports = router;
