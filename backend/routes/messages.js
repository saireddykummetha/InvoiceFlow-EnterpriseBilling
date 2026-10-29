const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

let messagesStore = [];

router.get(['/', ''], protect, (req, res) => {
  res.json(messagesStore);
});

router.post(['/', ''], protect, (req, res) => {
  const newMsg = {
    id: `MSG-${Date.now()}`,
    content: req.body?.content || '',
    sender: req.user?.name || 'User',
    sender_id: req.user?._id,
    project: req.body?.project || null,
    recipient: req.body?.recipient || null,
    conversation_type: req.body?.conversation_type || 'project_room',
    createdAt: new Date().toISOString(),
  };
  messagesStore.push(newMsg);
  res.status(201).json(newMsg);
});

router.post(['/mark-read', '/mark-read/'], protect, (req, res) => {
  res.json({ success: true, message: 'Messages marked read' });
});

module.exports = router;
