const express = require('express');
const { protect } = require('../middleware/auth');
const { Client, Vendor, Quote, Invoice, Payment } = require('../models');

const router = express.Router();

// Format currency helper
const formatCurrency = (amount) => {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
};

// GET /api/dashboard/ - Fetch real dashboard data from database
router.get(['/', ''], protect, async (req, res) => {
  try {
    // Fetch real counts from database
    const [clientsCount, vendorsCount, quotesCount, invoicesCount, payments] = await Promise.all([
      Client.countDocuments(),
      Vendor.countDocuments(),
      Quote.countDocuments(),
      Invoice.countDocuments(),
      Payment.find().sort({ createdAt: -1 }).limit(10),
    ]);

    // Fetch recent quotes and invoices
    const recentQuotes = await Quote.find()
      .populate('client')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentInvoices = await Invoice.find()
      .populate('client')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate quote status breakdown
    const quotesByStatus = await Quote.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const quoteStatusMap = {
      approved: { name: 'Approved', value: 0, percentage: 0, color: '#10B981' },
      pending: { name: 'Pending', value: 0, percentage: 0, color: '#F59E0B' },
      draft: { name: 'Draft', value: 0, percentage: 0, color: '#64748B' },
      rejected: { name: 'Rejected', value: 0, percentage: 0, color: '#EF4444' },
    };

    quotesByStatus.forEach(item => {
      const status = (item._id || '').toLowerCase();
      if (quoteStatusMap[status]) {
        quoteStatusMap[status].value = item.count;
      }
    });

    const totalQuotes = quotesCount || 1;
    const quoteBreakdown = Object.values(quoteStatusMap).map(item => ({
      ...item,
      percentage: Math.round((item.value / totalQuotes) * 100)
    }));

    // Calculate invoice status breakdown
    const invoicesByStatus = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const invoiceStatusMap = {
      paid: { name: 'Paid', value: 0, percentage: 0, color: '#10B981' },
      pending: { name: 'Pending', value: 0, percentage: 0, color: '#F59E0B' },
      overdue: { name: 'Overdue', value: 0, percentage: 0, color: '#EF4444' },
      draft: { name: 'Draft', value: 0, percentage: 0, color: '#64748B' },
    };

    invoicesByStatus.forEach(item => {
      const status = (item._id || '').toLowerCase();
      if (invoiceStatusMap[status]) {
        invoiceStatusMap[status].value = item.count;
      }
    });

    const totalInvoices = invoicesCount || 1;
    const invoiceBreakdown = Object.values(invoiceStatusMap).map(item => ({
      ...item,
      percentage: Math.round((item.value / totalInvoices) * 100)
    }));

    // Calculate total revenue from paid invoices
    const revenueResult = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Format recent data
    const formattedRecentQuotes = recentQuotes.map(q => ({
      id: q._id,
      quote_number: q.quote_number,
      client_name: typeof q.client === 'object' ? (q.client?.name || q.client?.company || '') : '',
      amount: formatCurrency(q.amount),
      status: q.status || 'draft',
      date: q.createdAt ? new Date(q.createdAt).toISOString().split('T')[0] : '',
    }));

    const formattedRecentInvoices = recentInvoices.map(inv => ({
      id: inv._id,
      invoice_number: inv.invoice_number,
      client_name: typeof inv.client === 'object' ? (inv.client?.name || inv.client?.company || '') : '',
      amount: formatCurrency(inv.amount),
      status: inv.status || 'pending',
      date: inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : '',
    }));

    const dashboardData = {
      clients: clientsCount,
      vendors: vendorsCount,
      quotations: quotesCount,
      invoices: invoicesCount,
      total_revenue: totalRevenue,
      stats: {
        clients: { value: String(clientsCount), growth: '+0.0%', from: 'total' },
        vendors: { value: String(vendorsCount), growth: '+0.0%', from: 'total' },
        quotations: { value: String(quotesCount), growth: '+0.0%', from: 'total' },
        invoices: { value: String(invoicesCount), growth: '+0.0%', from: 'total' },
        revenue: { value: formatCurrency(totalRevenue), growth: '+0.0%', from: 'total' },
      },
      quotations_by_status: {
        total: quotesCount,
        breakdown: quoteBreakdown,
      },
      invoices_by_status: {
        total: invoicesCount,
        breakdown: invoiceBreakdown,
      },
      overview_chart: [],
      recent_quotations: formattedRecentQuotes,
      recent_invoices: formattedRecentInvoices,
      recent_activities: [],
    };

    res.json({
      success: true,
      data: dashboardData,
      ...dashboardData,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

router.get(['/summary', '/summary/'], protect, (req, res) => {
  res.json({
    success: true,
    data: DASHBOARD_DATA.stats,
    ...DASHBOARD_DATA.stats,
  });
});

router.get(['/recent-invoices', '/recent-invoices/'], protect, (req, res) => {
  res.json({
    success: true,
    data: DASHBOARD_DATA.recent_invoices,
  });
});

router.get(['/recent-payments', '/recent-payments/'], protect, (req, res) => {
  res.json({
    success: true,
    data: [],
  });
});

router.get(['/search', '/search/'], protect, (req, res) => {
  res.json({
    success: true,
    data: [],
  });
});

module.exports = router;
