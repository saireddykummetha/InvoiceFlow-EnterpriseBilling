const express = require('express');
const { protect } = require('../middleware/auth');
const { Ticket } = require('../models');

const router = express.Router();

const formatTicket = (t) => ({
  id: t._id,
  _id: t._id,
  ticket_number: t.ticket_number,
  subject: t.subject,
  status: t.status || 'open',
  priority: t.priority || 'medium',
  replies: t.replies || [],
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

// GET /api/tickets/
router.get(['/', ''], protect, async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    const list = tickets.map(formatTicket);
    res.json({
      success: true,
      data: list,
      results: list,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// GET /api/tickets/:id/
router.get(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const t = await Ticket.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Ticket not found' });
    res.json({
      success: true,
      data: formatTicket(t),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ticket' });
  }
});

// POST /api/tickets/
router.post(['/', ''], protect, async (req, res) => {
  try {
    const t = await Ticket.create({
      ticket_number: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: req.body.subject || 'Support Ticket',
      status: req.body.status || 'open',
      priority: req.body.priority || 'medium',
      user: req.user?._id || null,
      replies: req.body.message
        ? [{ message: req.body.message, author: req.user?.name || 'User', created_at: new Date() }]
        : [],
    });
    res.status(201).json({
      success: true,
      data: formatTicket(t),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create ticket' });
  }
});

// PATCH /api/tickets/:id/
router.patch(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const t = await Ticket.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!t) return res.status(404).json({ message: 'Ticket not found' });
    res.json({
      success: true,
      data: formatTicket(t),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update ticket' });
  }
});

// DELETE /api/tickets/:id/
router.delete(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete ticket' });
  }
});

// POST /api/tickets/:id/reply/
router.post(['/:id/reply', '/:id/reply/'], protect, async (req, res) => {
  try {
    const t = await Ticket.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Ticket not found' });
    t.replies.push({
      message: req.body.message || req.body.reply || '',
      author: req.user?.name || 'Support Agent',
      created_at: new Date(),
    });
    await t.save();
    res.json({
      success: true,
      data: formatTicket(t),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reply to ticket' });
  }
});

module.exports = router;
