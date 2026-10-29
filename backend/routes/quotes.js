const express = require('express');
const { protect } = require('../middleware/auth');
const { Quote, Invoice } = require('../models');

const router = express.Router();

const formatQuote = (q) => ({
  id: q._id,
  _id: q._id,
  quote_number: q.quote_number,
  client: q.client,
  amount: q.amount || 0,
  status: q.status || 'draft',
  items: q.items || [],
  valid_until: q.valid_until,
  createdAt: q.createdAt,
  updatedAt: q.updatedAt,
});

// GET /api/quotes/
router.get(['/', ''], protect, async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    const list = quotes.map(formatQuote);
    res.json({
      success: true,
      data: list,
      results: list,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quotes' });
  }
});

// GET /api/quotes/:id/
router.get(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const q = await Quote.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Quote not found' });
    res.json({
      success: true,
      data: formatQuote(q),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quote' });
  }
});

// POST /api/quotes/
router.post(['/', ''], protect, async (req, res) => {
  try {
    // Generate unique quote number
    let quoteNumber = req.body.quote_number;
    if (!quoteNumber) {
      // Find the highest existing quote number and increment
      const lastQuote = await Quote.findOne().sort({ quote_number: -1 });
      let nextNum = 1;
      if (lastQuote && lastQuote.quote_number) {
        const numMatch = lastQuote.quote_number.match(/QUO-(\d+)/);
        if (numMatch) {
          nextNum = parseInt(numMatch[1]) + 1;
        }
      }
      quoteNumber = `QUO-${String(nextNum).padStart(4, '0')}`;
    }

    const quote = await Quote.create({
      quote_number: quoteNumber,
      client: req.body.client || null,
      amount: Number(req.body.amount || req.body.total || 0),
      status: req.body.status || 'draft',
      items: req.body.items || [],
      valid_until: req.body.valid_until || null,
      business: req.user?.business || null,
    });
    res.status(201).json({
      success: true,
      data: formatQuote(quote),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create quote' });
  }
});

// PATCH /api/quotes/:id/
router.patch(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const q = await Quote.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!q) return res.status(404).json({ message: 'Quote not found' });
    res.json({
      success: true,
      data: formatQuote(q),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update quote' });
  }
});

// DELETE /api/quotes/:id/
router.delete(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Quote deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete quote' });
  }
});

// Status actions
router.post(['/:id/approve', '/:id/approve/'], protect, async (req, res) => {
  try {
    const q = await Quote.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Quote not found' });
    q.status = 'approved';
    await q.save();
    res.json({ success: true, data: formatQuote(q) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve quote' });
  }
});

router.post(['/:id/reject', '/:id/reject/'], protect, async (req, res) => {
  try {
    const q = await Quote.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Quote not found' });
    q.status = 'rejected';
    await q.save();
    res.json({ success: true, data: formatQuote(q) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject quote' });
  }
});

router.post(['/:id/convert-to-invoice', '/:id/convert-to-invoice/'], protect, async (req, res) => {
  try {
    const q = await Quote.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Quote not found' });
    const inv = await Invoice.create({
      invoice_number: `INV-${String(Date.now()).slice(-4)}`,
      client: q.client,
      amount: q.amount,
      status: 'pending',
      items: q.items,
      due_date: new Date(Date.now() + 15 * 86400000),
      business: q.business,
    });
    res.json({ success: true, data: inv });
  } catch (err) {
    res.status(500).json({ message: 'Failed to convert quote to invoice' });
  }
});

// GET /api/quotes/:id/pdf/ - Download PDF
router.get(['/:id/pdf', '/:id/pdf/'], protect, async (req, res) => {
  try {
    const q = await Quote.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Quote not found' });

    // Simple text-based quote document (PDF generation requires additional libraries)
    const quoteContent = `
===========================================
               QUOTATION
===========================================

Quote #: ${q.quote_number}
Date: ${new Date().toLocaleDateString()}
Valid Until: ${q.valid_until ? new Date(q.valid_until).toLocaleDateString() : 'N/A'}

CLIENT: ${q.client || 'N/A'}
Amount: $${q.amount || 0}
Status: ${q.status || 'draft'}

-------------------------------------------
ITEMS
-------------------------------------------
${q.items && q.items.length > 0 ? q.items.map((item, i) => 
  `${i + 1}. ${item.description || 'Item'}
     Quantity: ${item.quantity || 1}
     Unit Price: $${item.unit_price || 0}
     Total: $${item.total || 0}`
).join('\n\n') : 'No items'}

-------------------------------------------
TOTAL: $${q.amount || 0}
===========================================

Generated by InvoiceFlow
    `.trim();

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="quote-${q.quote_number}.txt"`);
    res.send(quoteContent);
  } catch (err) {
    console.error('Quote download error:', err);
    res.status(500).json({ message: 'Failed to generate quote document' });
  }
});

module.exports = router;
