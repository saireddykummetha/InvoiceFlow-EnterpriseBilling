const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

const PLANS = [
  {
    plan_name: 'STARTER',
    display_name: 'Starter Plan',
    price: 999,
    features: ['Up to 25 Invoices / month', 'Client Portal', 'PDF Generation', 'Email Reminders'],
  },
  {
    plan_name: 'PROFESSIONAL',
    display_name: 'Professional Pro',
    price: 2499,
    features: ['Unlimited Invoices', 'Multi-user Access', 'Custom Templates', 'Dynamic UPI QR', 'Priority Support'],
  },
  {
    plan_name: 'ENTERPRISE',
    display_name: 'Enterprise Scale',
    price: 5999,
    features: ['Unlimited Everything', 'Dedicated Account Manager', 'Custom Domain', 'Webhook & API Integrations'],
  },
];

router.get(['/usage', '/usage/'], protect, (req, res) => {
  res.json({
    success: true,
    data: {
      is_trial: true,
      trial_exhausted: false,
      plan_name: 'Starter Trial',
      projects: {
        used: 2,
        limit: 10,
        remaining: 8,
        percentage: 20,
      },
    },
  });
});

router.get(['/current', '/current/'], protect, (req, res) => {
  res.json({
    success: true,
    data: {
      plan_name: 'Starter Trial',
      status: 'active',
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
    },
  });
});

router.get(['/plans', '/plans/'], protect, (req, res) => {
  res.json({
    success: true,
    data: PLANS,
  });
});

router.post(['/upgrade', '/upgrade/'], protect, (req, res) => {
  res.json({
    success: true,
    message: 'Upgrade initialized',
    data: { order_id: `order_${Date.now()}`, ...req.body },
  });
});

router.post(['/payment/verify', '/payment/verify/'], protect, (req, res) => {
  res.json({
    success: true,
    message: 'Subscription plan upgraded successfully!',
  });
});

module.exports = router;
