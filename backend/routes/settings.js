const express = require('express');
const { protect } = require('../middleware/auth');
const { AppSettings, BusinessProfile } = require('../models');

const router = express.Router();

const DEFAULT_SETTINGS = {
  general: {
    companyName: 'InvoiceFlow',
    currency: 'INR',
    currencySymbol: '₹',
    dateFormat: 'DD/MM/YYYY',
    decimalPlaces: 2,
    timezone: 'Asia/Kolkata',
  },
  business: {
    companyName: 'InvoiceFlow Technologies',
    legalName: 'InvoiceFlow Technologies Pvt. Ltd.',
    email: 'admin@invoiceflow.com',
    phone: '+91 9876543210',
    country: 'India',
    state: 'Telangana',
    city: 'Hyderabad',
    postalCode: '500081',
    address: 'Hitech City, Hyderabad',
    taxNumber: '36ABCDE1234F1Z5',
    gstin: '36ABCDE1234F1Z5',
    currency: 'INR',
  },
  quotation: {
    prefix: 'QUO',
    nextNumber: 1,
    validityDays: 15,
    defaultTaxRate: 18,
    defaultDiscountType: 'amount',
    selectedTemplate: 'template1',
  },
  invoice: {
    prefix: 'INV',
    nextNumber: 1,
    dueDays: 15,
    defaultTaxRate: 18,
    autoRoundOff: true,
    selectedTemplate: 'template1',
  },
  payments: {
    currency: 'INR',
    currencySymbol: '₹',
    currencyPosition: 'left',
    upiEnabled: true,
    upiId: 'invoiceflow@upi',
    bankTransferEnabled: true,
    bankName: 'HDFC Bank',
    accountName: 'InvoiceFlow Technologies',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0001234',
    cashEnabled: true,
    onlineEnabled: true,
  },
  tax: {
    enabled: true,
    taxName: 'GST',
    defaultRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    gstNumber: '36ABCDE1234F1Z5',
    hsnSacEnabled: true,
  },
  emails: {
    fromName: 'InvoiceFlow Team',
    replyTo: 'support@invoiceflow.com',
  },
  pdf: {
    pageSize: 'A4',
    accentColor: '#6342ff',
    showLogo: true,
    showSignature: true,
    footerText: 'Thank you for your business!',
  },
  translate: {},
  extras: {
    defaultDark: false,
    darkMode: false,
  },
  license: {
    tier: 'Enterprise Suite',
    status: 'Active',
  },
};

// GET /api/settings/
router.get(['/', ''], protect, async (req, res) => {
  try {
    let settings = null;
    if (req.user.business) {
      settings = await AppSettings.findOne({ business: req.user.business });
      const business = await BusinessProfile.findById(req.user.business);
      if (business) {
        DEFAULT_SETTINGS.business.companyName = business.companyName || DEFAULT_SETTINGS.business.companyName;
        DEFAULT_SETTINGS.business.email = business.email || DEFAULT_SETTINGS.business.email;
      }
    }

    // If settings exist in DB, use them; otherwise use defaults
    const finalSettings = settings ? { ...DEFAULT_SETTINGS, ...settings.toObject() } : DEFAULT_SETTINGS;

    res.json({
      success: true,
      data: finalSettings,
      ...finalSettings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve settings' });
  }
});

// PUT /api/settings/
router.put(['/', ''], protect, async (req, res) => {
  try {
    const businessId = req.user.business || req.user._id;
    
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'Business ID or User ID required' });
    }

    const updated = { ...DEFAULT_SETTINGS, ...req.body };
    
    // Upsert settings to database
    await AppSettings.findOneAndUpdate(
      { business: businessId },
      { $set: updated },
      { upsert: true, returnDocument: 'after' }
    );

    res.json({
      success: true,
      data: updated,
      message: 'Settings updated successfully.',
    });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to update settings: ' + err.message });
  }
});

// PATCH /api/settings/
router.patch(['/', ''], protect, async (req, res) => {
  try {
    const businessId = req.user.business || req.user._id;
    
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'Business ID or User ID required' });
    }

    // Update specific section in database
    const updateData = {};
    for (const key in req.body) {
      updateData[key] = req.body[key];
    }

    await AppSettings.findOneAndUpdate(
      { business: businessId },
      { $set: updateData },
      { upsert: true, returnDocument: 'after' }
    );

    // Fetch updated settings
    const settings = await AppSettings.findOne({ business: businessId });
    const finalSettings = settings ? { ...DEFAULT_SETTINGS, ...settings.toObject() } : { ...DEFAULT_SETTINGS, ...updateData };

    res.json({
      success: true,
      data: finalSettings,
      message: 'Settings section updated successfully.',
    });
  } catch (err) {
    console.error('Update settings section error:', err);
    res.status(500).json({ success: false, message: 'Failed to update settings section: ' + err.message });
  }
});

module.exports = router;
