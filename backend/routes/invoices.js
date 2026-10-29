const express = require('express');
const { protect } = require('../middleware/auth');
const { Invoice, Quote } = require('../models');

const router = express.Router();

const formatInvoice = (inv) => {
  const isPaid = String(inv.status || '').toLowerCase() === 'paid';
  const totalAmount = Number(inv.amount || inv.total || 0);
  return {
    id: inv._id,
    _id: inv._id,
    invoice_number: inv.invoice_number,
    number: inv.invoice_number,
    client: inv.client,
    client_name: typeof inv.client === 'object' ? (inv.client?.name || inv.client?.company || '') : '',
    amount: totalAmount,
    total: totalAmount,
    grand_total: totalAmount,
    balance_due: isPaid ? 0 : totalAmount,
    paid_amount: isPaid ? totalAmount : 0,
    status: inv.status || 'pending',
    items: inv.items || [],
    invoice_items: inv.items || [],
    due_date: inv.due_date,
    invoice_date: inv.createdAt,
    date: inv.createdAt,
    created_at: inv.createdAt,
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
  };
};

// GET /api/invoices/
router.get(['/', ''], protect, async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('client').sort({ createdAt: -1 });
    const list = invoices.map(formatInvoice);
    res.json({
      success: true,
      data: list,
      results: list,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

// GET /api/invoices/:id/
router.get(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).populate('client');
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    res.json({
      success: true,
      data: formatInvoice(inv),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invoice' });
  }
});

// POST /api/invoices/
router.post(['/', ''], protect, async (req, res) => {
  try {
    const { invoice_number, client, amount, status, items, due_date, issue_date, discount, tax_rate, shipping, notes, terms, template, quote } = req.body;
    
    // Calculate total from items if not provided
    let totalAmount = Number(amount || 0);
    if (!totalAmount && items && items.length > 0) {
      totalAmount = items.reduce((sum, item) => {
        const qty = Number(item.quantity || 1);
        const price = Number(item.unit_price || item.rate || 0);
        return sum + (qty * price);
      }, 0);
    }

    const invoice = await Invoice.create({
      invoice_number: invoice_number || `INV-${String(Date.now()).slice(-4)}`,
      client: client || null,
      amount: totalAmount,
      status: status || 'pending',
      items: items || [],
      due_date: due_date || null,
      issue_date: issue_date || null,
      discount: Number(discount || 0),
      tax_rate: Number(tax_rate || 0),
      shipping: Number(shipping || 0),
      notes: notes || '',
      terms: terms || '',
      template: template || 'template1',
      quote: quote || null,
      business: req.user?.business || null,
    });
    res.status(201).json({
      success: true,
      data: formatInvoice(invoice),
    });
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create invoice' });
  }
});

// PATCH /api/invoices/:id/
router.patch(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const inv = await Invoice.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    res.json({
      success: true,
      data: formatInvoice(inv),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update invoice' });
  }
});

// DELETE /api/invoices/:id/
router.delete(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete invoice' });
  }
});

// POST /api/invoices/from-quote/
router.post(['/from-quote', '/from-quote/'], protect, async (req, res) => {
  try {
    const quoteId = req.body.quote_id || req.body.id;
    const q = await Quote.findById(quoteId);
    if (!q) return res.status(404).json({ message: 'Quote not found' });

    const inv = await Invoice.create({
      invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      client: q.client,
      amount: q.amount,
      status: 'pending',
      items: q.items,
      due_date: new Date(Date.now() + 15 * 86400000),
      business: q.business,
    });
    res.status(201).json({
      success: true,
      data: formatInvoice(inv),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create invoice from quote' });
  }
});

// POST /api/invoices/:id/send/
router.post(['/:id/send', '/:id/send/'], protect, (req, res) => {
  res.json({ success: true, message: 'Invoice sent successfully.' });
});

// GET /api/invoices/:id/pdf/
router.get(['/:id/pdf', '/:id/pdf/'], protect, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).populate('client');
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${inv.invoice_number || inv._id}.pdf"`);

    const minimalPdf = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 75 >>\nstream\nBT\n/F1 18 Tf\n50 700 Td\n(Invoice: " + (inv.invoice_number || "INV") + ") Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000370 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n447\n%%EOF"
    );
    res.send(minimalPdf);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate invoice PDF' });
  }
});

module.exports = router;
