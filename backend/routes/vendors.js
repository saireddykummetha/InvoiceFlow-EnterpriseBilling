const express = require('express');
const { protect } = require('../middleware/auth');
const { Vendor } = require('../models');

const router = express.Router();

const formatVendor = (v) => ({
  id: v._id,
  _id: v._id,
  name: v.name,
  email: v.email || '',
  phone: v.phone || '',
  category: v.category || 'General',
  status: v.status || 'active',
  createdAt: v.createdAt,
  updatedAt: v.updatedAt,
});

// GET /api/vendors/stats/
router.get(['/stats', '/stats/'], protect, async (req, res) => {
  try {
    const all = await Vendor.find();
    res.json({
      success: true,
      data: {
        total: all.length,
        active: all.filter((v) => v.status === 'active').length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vendor stats' });
  }
});

// GET /api/vendors/
router.get(['/', ''], protect, async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    const list = vendors.map(formatVendor);
    res.json({
      success: true,
      data: list,
      results: list,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vendors' });
  }
});

// GET /api/vendors/:id/
router.get(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({
      success: true,
      data: formatVendor(vendor),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vendor' });
  }
});

// POST /api/vendors/
router.post(['/', ''], protect, async (req, res) => {
  try {
    const vendor = await Vendor.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      category: req.body.category || 'General',
      status: req.body.status || 'active',
      business: req.user?.business || null,
    });
    res.status(201).json({
      success: true,
      data: formatVendor(vendor),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create vendor' });
  }
});

// PATCH /api/vendors/:id/
router.patch(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({
      success: true,
      data: formatVendor(vendor),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update vendor' });
  }
});

// DELETE /api/vendors/:id/
router.delete(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    await Vendor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Vendor deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete vendor' });
  }
});

module.exports = router;
