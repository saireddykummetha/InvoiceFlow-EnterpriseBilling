const express = require('express');
const { protect } = require('../middleware/auth');
const { Payment, Invoice } = require('../models');

const router = express.Router();

const formatPayment = (p) => ({
  id: p._id,
  _id: p._id,
  payment_number: p.payment_number,
  invoice: p.invoice,
  amount: p.amount || 0,
  method: p.method || 'UPI',
  status: p.status || 'completed',
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

// GET /api/payments/
router.get(['/', ''], protect, async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    const list = payments.map(formatPayment);
    res.json({
      success: true,
      data: list,
      results: list,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// GET /api/payments/:id/
router.get(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({
      success: true,
      data: formatPayment(payment),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment' });
  }
});

// POST /api/payments/
router.post(['/', ''], protect, async (req, res) => {
  try {
    const payment = await Payment.create({
      payment_number: req.body.payment_number || `PAY-${String(Date.now()).slice(-4)}`,
      invoice: req.body.invoice || null,
      amount: Number(req.body.amount || 0),
      method: req.body.method || 'UPI',
      status: req.body.status || 'completed',
      business: req.user?.business || null,
    });

    // Update invoice status to 'paid' when payment is completed
    if (payment.invoice && payment.status === 'completed') {
      await Invoice.findByIdAndUpdate(payment.invoice, { status: 'paid' });
    }

    res.status(201).json({
      success: true,
      data: formatPayment(payment),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to record payment' });
  }
});

// POST /api/payments/manual/
router.post(['/manual', '/manual/'], protect, async (req, res) => {
  try {
    const payment = await Payment.create({
      payment_number: `PAY-MANUAL-${String(Date.now()).slice(-4)}`,
      invoice: req.body.invoice || null,
      amount: Number(req.body.amount || 0),
      method: req.body.method || 'Cash / Bank',
      status: 'completed',
      business: req.user?.business || null,
    });

    // Update invoice status to 'paid' when manual payment is completed
    if (payment.invoice && payment.status === 'completed') {
      await Invoice.findByIdAndUpdate(payment.invoice, { status: 'paid' });
    }

    res.status(201).json({
      success: true,
      data: formatPayment(payment),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to record manual payment' });
  }
});

// Payment gateway helpers
router.post(['/create-order', '/create-order/'], protect, async (req, res) => {
  try {
    const { invoice_id, amount } = req.body;
    console.log('Create order request:', { invoice_id, amount });
    
    // For demo purposes, return a mock Razorpay order response
    // In production, this would call Razorpay API to create a real order
    const gateway_order_id = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    res.json({
      success: true,
      data: {
        gateway_order_id: gateway_order_id,
        order_id: gateway_order_id,
        amount: amount,
        currency: 'INR',
        key_id: 'rzp_test_demo_key', // Demo key - in production use your actual Razorpay key
        payment_id: `pay_${Date.now()}`,
      },
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

router.post(['/verify', '/verify/'], protect, async (req, res) => {
  try {
    const { payment_id, gateway_payment_id, gateway_signature } = req.body;
    console.log('Verify payment request:', { payment_id, gateway_payment_id });
    
    // For demo purposes, always verify successfully
    // In production, verify the Razorpay signature
    res.json({ 
      success: true, 
      message: 'Payment verified.',
      data: {
        payment_id: payment_id,
        gateway_payment_id: gateway_payment_id,
        receipt: {
          id: `receipt_${Date.now()}`
        }
      }
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

router.post(['/clean-pending', '/clean-pending/'], protect, (req, res) => {
  res.json({ success: true, message: 'Cleaned pending payments.' });
});

module.exports = router;
