const express = require('express');
const { protect } = require('../middleware/auth');
const { Invoice, Quote, Payment, Client } = require('../models');

const router = express.Router();

// GET /api/reports/dashboard/
router.get(['/dashboard', '/dashboard/'], protect, async (req, res) => {
  try {
    const [invoices, quotes, payments, clients] = await Promise.all([
      Invoice.find(),
      Quote.find(),
      Payment.find(),
      Client.find(),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({
      success: true,
      data: {
        summary: {
          total_revenue: totalRevenue,
          invoices_count: invoices.length,
          quotes_count: quotes.length,
          clients_count: clients.length,
        },
        monthly_sales: [],
        tax_summary: [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report dashboard' });
  }
});

// GET /api/reports/sales/
router.get(['/sales', '/sales/'], protect, async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json({
      success: true,
      data: {
        total: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
        results: invoices,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales report' });
  }
});

// GET /api/reports/payments/
router.get(['/payments', '/payments/'], protect, async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json({
      success: true,
      data: {
        total: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        results: payments,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments report' });
  }
});

// GET /api/reports/tax/
router.get(['/tax', '/tax/'], protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        results: [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tax report' });
  }
});

// GET /api/reports/clients/
router.get(['/clients', '/clients/'], protect, async (req, res) => {
  try {
    const clients = await Client.find();
    res.json({
      success: true,
      data: {
        total: clients.length,
        results: clients,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch clients report' });
  }
});

// GET /api/reports/profit-loss/
router.get(['/profit-loss', '/profit-loss/'], protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        income: 0,
        expense: 0,
        net_profit: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profit-loss report' });
  }
});

module.exports = router;
