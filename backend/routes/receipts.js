const express = require('express');
const { protect } = require('../middleware/auth');
const { Payment, Invoice } = require('../models');

const router = express.Router();

// GET /api/receipts/
router.get(['/', ''], protect, async (req, res) => {
  try {
    const { invoice: invoiceId } = req.query;
    const query = {};
    if (invoiceId) {
      query.invoice = invoiceId;
    }
    const payments = await Payment.find(query).populate('invoice').sort({ createdAt: -1 });
    const list = payments.map((p) => ({
      id: p._id,
      _id: p._id,
      receipt_number: `REC-${p.payment_number || String(p._id).slice(-6).toUpperCase()}`,
      invoice: p.invoice,
      invoice_number: p.invoice?.invoice_number || 'INV-001',
      client_name: p.invoice?.client?.name || p.invoice?.client_name || 'Valued Client',
      amount: p.amount || 0,
      payment_method: p.method || 'UPI',
      status: p.status || 'completed',
      issued_date: p.createdAt,
      created_at: p.createdAt,
    }));
    res.json({
      success: true,
      data: list,
      results: list,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch receipts' });
  }
});

// GET /api/receipts/:id/
router.get(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('invoice');
    if (!payment) return res.status(404).json({ message: 'Receipt not found' });
    const receipt = {
      id: payment._id,
      _id: payment._id,
      receipt_number: `REC-${payment.payment_number || String(payment._id).slice(-6).toUpperCase()}`,
      invoice: payment.invoice,
      invoice_number: payment.invoice?.invoice_number || 'INV-001',
      client_name: payment.invoice?.client?.name || payment.invoice?.client_name || 'Valued Client',
      amount: payment.amount || 0,
      payment_method: payment.method || 'UPI',
      status: payment.status || 'completed',
      issued_date: payment.createdAt,
      created_at: payment.createdAt,
    };
    res.json({
      success: true,
      data: receipt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch receipt' });
  }
});

// GET /api/receipts/:id/pdf/
router.get(['/:id/pdf', '/:id/pdf/'], protect, async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt_${req.params.id}.pdf"`);
    const minimalPdf = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 70 >>\nstream\nBT\n/F1 18 Tf\n50 700 Td\n(Payment Receipt) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000370 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n447\n%%EOF"
    );
    res.send(minimalPdf);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate receipt PDF' });
  }
});

module.exports = router;
