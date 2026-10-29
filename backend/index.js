require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route Handlers
const authRoutes = require('./routes');
const settingsRoutes = require('./routes/settings');
const dashboardRoutes = require('./routes/dashboard');
const subscriptionRoutes = require('./routes/subscriptions');
const projectRoutes = require('./routes/projects');
const clientRoutes = require('./routes/clients');
const vendorRoutes = require('./routes/vendors');
const taskRoutes = require('./routes/tasks');
const deliverableRoutes = require('./routes/deliverables');
const quoteRoutes = require('./routes/quotes');
const invoiceRoutes = require('./routes/invoices');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const ticketRoutes = require('./routes/tickets');
const receiptRoutes = require('./routes/receipts');
const reportRoutes = require('./routes/reports');
const documentRoutes = require('./routes/documents');
const messageRoutes = require('./routes/messages');
const superadminRoutes = require('./routes/superadmin');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Health check
app.get(['/', '/api/health'], (req, res) => {
  res.json({
    status: 'online',
    service: 'InvoiceFlow Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes at both /api/... and /... for full frontend client compatibility
const mountRoute = (path, handler) => {
  app.use(`/api/${path}`, handler);
  app.use(`/${path}`, handler);
};

mountRoute('auth', authRoutes);
mountRoute('settings', settingsRoutes);
mountRoute('dashboard', dashboardRoutes);
mountRoute('subscriptions', subscriptionRoutes);
mountRoute('projects', projectRoutes);
mountRoute('clients', clientRoutes);
mountRoute('vendors', vendorRoutes);
mountRoute('tasks', taskRoutes);
mountRoute('deliverables', deliverableRoutes);
mountRoute('quotes', quoteRoutes);
mountRoute('invoices', invoiceRoutes);
mountRoute('payments', paymentRoutes);
mountRoute('notifications', notificationRoutes);
mountRoute('tickets', ticketRoutes);
mountRoute('receipts', receiptRoutes);
mountRoute('reports', reportRoutes);
mountRoute('documents', documentRoutes);
mountRoute('messages', messageRoutes);
mountRoute('superadmin', superadminRoutes);

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Fatal initialization error:', err);
  app.listen(PORT, () => console.log(`Server started on fallback port http://localhost:${PORT}`));
});
