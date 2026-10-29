const express = require('express');
const { protect } = require('../middleware/auth');
const { Deliverable } = require('../models');

const router = express.Router();

const formatDeliverable = (d) => ({
  id: d._id,
  _id: d._id,
  title: d.title,
  project: d.project,
  status: d.status || 'pending',
  due_date: d.due_date,
  feedback: d.feedback || '',
  createdAt: d.createdAt,
  updatedAt: d.updatedAt,
});

// GET /api/deliverables/
router.get(['/', ''], protect, async (req, res) => {
  try {
    const deliverables = await Deliverable.find().sort({ createdAt: -1 });
    res.json(deliverables.map(formatDeliverable));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch deliverables' });
  }
});

// GET /api/deliverables/:id/
router.get(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const d = await Deliverable.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Deliverable not found' });
    res.json(formatDeliverable(d));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch deliverable' });
  }
});

// POST /api/deliverables/
router.post(['/', ''], protect, async (req, res) => {
  try {
    const d = await Deliverable.create({
      title: req.body.title,
      project: req.body.project || null,
      status: req.body.status || 'pending',
      due_date: req.body.due_date || null,
      business: req.user?.business || null,
    });
    res.status(201).json(formatDeliverable(d));
  } catch (err) {
    res.status(500).json({ message: 'Failed to create deliverable' });
  }
});

// PATCH /api/deliverables/:id/
router.patch(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const d = await Deliverable.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!d) return res.status(404).json({ message: 'Deliverable not found' });
    res.json(formatDeliverable(d));
  } catch (err) {
    res.status(500).json({ message: 'Failed to update deliverable' });
  }
});

// DELETE /api/deliverables/:id/
router.delete(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    await Deliverable.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deliverable deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete deliverable' });
  }
});

// Review actions
router.post(['/:id/admin-review', '/:id/admin-review/'], protect, async (req, res) => {
  try {
    const d = await Deliverable.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Deliverable not found' });
    d.status = req.body.action === 'approve' ? 'approved' : 'rejected';
    d.feedback = req.body.feedback || '';
    await d.save();
    res.json(formatDeliverable(d));
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

router.post(['/:id/client-review', '/:id/client-review/'], protect, async (req, res) => {
  try {
    const d = await Deliverable.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Deliverable not found' });
    d.status = req.body.action === 'approve' ? 'approved' : 'rejected';
    d.feedback = req.body.feedback || '';
    await d.save();
    res.json(formatDeliverable(d));
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit client review' });
  }
});

module.exports = router;
