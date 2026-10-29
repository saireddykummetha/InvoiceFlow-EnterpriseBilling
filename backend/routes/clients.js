const express = require('express');
const { protect } = require('../middleware/auth');
const { Client } = require('../models');

const router = express.Router();

const formatClient = (c) => ({
  id: c._id,
  _id: c._id,
  name: c.name,
  email: c.email || '',
  phone: c.phone || '',
  company: c.company || c.company_name || '',
  company_name: c.company_name || c.company || '',
  address: c.address || '',
  city: c.city || '',
  state: c.state || '',
  postal_code: c.postal_code || '',
  country: c.country || 'India',
  gstin: c.gstin || '',
  notes: c.notes || '',
  status: c.status || 'active',
  is_active: c.status === 'active',
  invoice_count: 0,
  outstanding: 0,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

// GET /api/clients/
router.get(['/', ''], protect, async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    const list = clients.map(formatClient);
    res.json({
      success: true,
      data: list,
      results: list,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch clients' });
  }
});

// GET /api/clients/:id/
router.get(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({
      success: true,
      data: formatClient(client),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch client' });
  }
});

// POST /api/clients/
router.post(['/', ''], protect, async (req, res) => {
  try {
    const { name, email, phone, company, company_name, address, city, state, postal_code, country, gstin, notes, is_active, status, create_portal_access, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Client name is required.' });
    }

    const client = await Client.create({
      name: name.trim(),
      email: email?.trim() || '',
      phone: phone?.trim() || '',
      company: company_name?.trim() || company?.trim() || name.trim(),
      address: address?.trim() || '',
      city: city?.trim() || '',
      state: state?.trim() || '',
      postal_code: postal_code?.trim() || '',
      country: country?.trim() || 'India',
      gstin: gstin?.trim() || '',
      notes: notes?.trim() || '',
      status: status || (is_active ? 'active' : 'inactive'),
      business: req.user?.business || null,
    });
    res.status(201).json({
      success: true,
      data: formatClient(client),
    });
  } catch (err) {
    console.error('Create client error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A client with this email already exists.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Failed to create client' });
  }
});

// PATCH /api/clients/:id/
router.patch(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({
      success: true,
      data: formatClient(client),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id/
router.delete(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete client' });
  }
});

// Credentials placeholders
router.post(['/:id/credentials', '/:id/credentials/'], protect, async (req, res) => {
  const client = await Client.findById(req.params.id);
  const now = Date.now();
  const tempPassword = req.body?.password || `Client@${String(now).slice(-4)}`;
  res.json({
    success: true,
    message: 'Client portal credentials generated.',
    data: {
      email: client?.email || req.body?.email || 'client@example.com',
      password: tempPassword,
    },
  });
});

router.get(['/:id/credentials', '/:id/credentials/'], protect, (req, res) => {
  res.json({ success: true, data: { enabled: true, username: 'client' } });
});

module.exports = router;
