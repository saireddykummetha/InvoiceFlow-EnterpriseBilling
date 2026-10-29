const express = require('express');
const { protect } = require('../middleware/auth');
const { User, BusinessProfile, AppSettings } = require('../models');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Create new business tenant
router.post(['/tenants', '/tenants/'], protect, async (req, res) => {
  try {
    const { business_name, admin_name, admin_email, admin_password, currency, phone } = req.body;

    // Validation
    if (!business_name || !admin_email || !admin_password) {
      return res.status(400).json({
        success: false,
        message: 'Business name, admin email, and admin password are required.'
      });
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: admin_email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Admin email already exists.'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(admin_password, 12);

    // Create user
    const user = await User.create({
      name: admin_name || business_name,
      email: admin_email.toLowerCase().trim(),
      password: passwordHash,
      role: 'admin',
    });

    // Create business profile
    const business = await BusinessProfile.create({
      owner: user._id,
      companyName: business_name,
      email: admin_email.toLowerCase().trim(),
      phone: phone || '',
    });

    // Update user with business reference
    user.business = business._id;
    await user.save();

    // Create app settings
    await AppSettings.create({
      business: business._id,
      currency: currency || 'USD',
      invoicePrefix: 'INV',
    });

    res.status(201).json({
      success: true,
      message: 'Business created with Free Trial!',
      data: {
        business_id: business._id,
        user_id: user._id,
        business_name: business.companyName,
        admin_email: user.email,
      }
    });
  } catch (err) {
    console.error('Create tenant error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create business.'
    });
  }
});

// Get all tenants
router.get(['/tenants', '/tenants/'], protect, async (req, res) => {
  try {
    const businesses = await BusinessProfile.find()
      .populate('owner', 'name email role')
      .sort({ createdAt: -1 });

    const tenants = businesses.map(b => ({
      id: b._id,
      business_name: b.companyName,
      admin_name: b.owner?.name || 'Unknown',
      admin_email: b.owner?.email || 'Unknown',
      created_at: b.createdAt,
    }));

    res.json({
      success: true,
      data: tenants,
      results: tenants.length
    });
  } catch (err) {
    console.error('Get tenants error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenants.'
    });
  }
});

// Get all users
router.get(['/users', '/users/'], protect, async (req, res) => {
  try {
    const { search, role } = req.query;
    
    let query = {};
    if (role && role !== '') {
      query.role = role;
    }
    if (search && search !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 });

    const userList = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      is_active: u.is_active !== false,
      created_at: u.createdAt,
      business: u.business,
    }));

    res.json({
      success: true,
      data: userList,
      results: userList.length
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.'
    });
  }
});

// Update user (change role only)
router.patch(['/users', '/users/'], protect, async (req, res) => {
  try {
    const { user_id, role } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.'
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required.'
      });
    }

    const user = await User.findByIdAndUpdate(
      user_id,
      { $set: { role } },
      { returnDocument: 'after' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update user.'
    });
  }
});

// Get platform stats
router.get(['/stats', '/stats/'], protect, async (req, res) => {
  try {
    const timeRange = req.query.time_range || '6_months';

    const totalBusinesses = await BusinessProfile.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProjects = 0; // Would need Project model

    const metrics = {
      total_businesses: totalBusinesses,
      total_users: totalUsers,
      total_projects: totalProjects,
      active_subscriptions: totalBusinesses,
      monthly_subscription_revenue: totalBusinesses * 999,
      free_trials_active: totalBusinesses,
      free_trials_exhausted: 0,
    };

    const growth_chart = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      businesses: [1, 2, 3, 4, 5, totalBusinesses],
      users: [1, 3, 5, 8, 12, totalUsers],
      projects: [0, 1, 2, 3, 4, totalProjects],
      revenue: [999, 1998, 2997, 3996, 4995, totalBusinesses * 999],
    };

    const subscription_overview = {
      free_trial: { count: totalBusinesses, active: totalBusinesses, exhausted: 0 },
      starter: { count: 0, percentage: 0 },
      professional: { count: 0, percentage: 0 },
      enterprise: { count: 0, percentage: 0 },
      total_subscriptions: totalBusinesses,
      active_paid_subscriptions: 0,
      cancelled_subscriptions: 0,
    };

    const recent_businesses = await BusinessProfile.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        metrics,
        growth_chart,
        subscription_overview,
        recent_businesses: recent_businesses.map(b => ({
          id: b._id,
          business_name: b.companyName,
          admin_name: b.owner?.name || 'Unknown',
          admin_email: b.owner?.email || 'Unknown',
          created_at: b.createdAt,
        })),
        recent_activities: [],
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats.'
    });
  }
});

module.exports = router;
