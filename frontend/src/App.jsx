import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

/* =========================================================
   AUTH / ROUTE GUARDS
========================================================= */

import ProtectedRoute from "./components/auth/ProtectedRoute";
import SuperAdminRoute from "./components/auth/SuperAdminRoute";
import AdminRoute from "./components/auth/AdminRoute";
import VendorRoute from "./components/auth/VendorRoute";
import ClientRoute from "./components/auth/ClientRoute";

/* =========================================================
   LAYOUTS
========================================================= */

import SuperAdminLayout from "./components/layout/SuperAdminLayout";
import AdminLayout from "./components/layout/AdminLayout";
import VendorLayout from "./components/layout/VendorLayout";
import ClientLayout from "./components/layout/ClientLayout";
import SettingsLayout from "./components/layout/SettingsLayout";

/* =========================================================
   SUPER ADMIN PAGES
========================================================= */

import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import SuperAdminTenants from "./pages/superadmin/Tenants";
import SuperAdminUsers from "./pages/superadmin/Users";
import SuperAdminSubscriptions from "./pages/superadmin/Subscriptions";
import SuperAdminPlans from "./pages/superadmin/Plans";
import SuperAdminPayments from "./pages/superadmin/Payments";
import SuperAdminInvoices from "./pages/superadmin/Invoices";
import SuperAdminProjects from "./pages/superadmin/Projects";
import SuperAdminAuditLogs from "./pages/superadmin/AuditLogs";
import SuperAdminNotifications from "./pages/superadmin/Notifications";
import SuperAdminSettings from "./pages/superadmin/Settings";
import SuperAdminIntegrations from "./pages/superadmin/Integrations";
import SuperAdminTickets from "./pages/superadmin/Tickets";
import SuperAdminReports from "./pages/superadmin/Reports";
import SuperAdminSystemHealth from "./pages/superadmin/SystemHealth";

/* =========================================================
   VENDOR PORTAL PAGES
========================================================= */

import VendorDashboard from "./pages/vendor/Dashboard";
import VendorProjects from "./pages/vendor/Projects";
import VendorTasks from "./pages/vendor/Tasks";
import VendorDeliverables from "./pages/vendor/Deliverables";
import VendorOrders from "./pages/vendor/Orders";
import VendorInvoices from "./pages/vendor/Invoices";
import VendorPayments from "./pages/vendor/Payments";
import VendorDocuments from "./pages/vendor/Documents";
import VendorMessages from "./pages/vendor/Messages";
import VendorProfile from "./pages/vendor/Profile";

/* =========================================================
   PUBLIC AUTH & HOME
========================================================= */

import LandingPage from "./pages/public/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

/* =========================================================
   ADMIN PAGES
========================================================= */

import AdminDashboard from "./pages/admin/Dashboard";

// Projects & Operations
import ProjectList from "./pages/admin/projects/ProjectList";
import ProjectDetails from "./pages/admin/projects/ProjectDetails";
import TaskList from "./pages/admin/tasks/TaskList";
import DeliverableList from "./pages/admin/deliverables/DeliverableList";
import DeliverableDetails from "./pages/admin/deliverables/DeliverableDetails";

// Clients
import ClientList from "./pages/admin/clients/ClientList";
import AddClient from "./pages/admin/clients/AddClient";
import EditClient from "./pages/admin/clients/EditClient";
import ViewClient from "./pages/admin/clients/ViewClient";

// Vendors
import VendorList from "./pages/admin/vendors/VendorList";
import AddVendor from "./pages/admin/vendors/AddVendor";
import EditVendor from "./pages/admin/vendors/EditVendor";
import ViewVendor from "./pages/admin/vendors/ViewVendor";

// Quotes & Invoices
import QuoteList from "./pages/admin/quotes/QuoteList";
import QuoteDetails from "./pages/admin/quotes/QuoteDetails";
import AddQuote from "./pages/admin/quotes/AddQuote";
import EditQuote from "./pages/admin/quotes/EditQuote";

import InvoiceList from "./pages/admin/invoices/InvoiceList";
import AddInvoice from "./pages/admin/invoices/AddInvoice";
import EditInvoice from "./pages/admin/invoices/EditInvoice";
import InvoiceDetails from "./pages/admin/invoices/InvoiceDetails";

// Payments & Reports
import PaymentList from "./pages/admin/payments/PaymentList";
import PaymentDetails from "./pages/admin/payments/PaymentDetails";
import ReportDashboard from "./pages/admin/reports/ReportDashboard";

// Documents & Messages
import DocumentList from "./pages/admin/documents/DocumentList";
import MessageCenter from "./pages/admin/messages/MessageCenter";

// Support Tickets
import AdminTicketList from "./pages/admin/tickets/TicketList";
import AdminTicketDetails from "./pages/admin/tickets/TicketDetails";
import SubscriptionUpgrade from "./pages/admin/subscription/SubscriptionUpgrade";
import AdminNotificationList from "./pages/admin/notifications/NotificationList";

// Settings
import SettingsHub from "./pages/admin/settings/SettingsHub";
import General from "./pages/admin/settings/General";
import Business from "./pages/admin/settings/Business";
import Quotation from "./pages/admin/settings/Quotation";
import Invoice from "./pages/admin/settings/Invoice";
import Payments from "./pages/admin/settings/Payments";
import Tax from "./pages/admin/settings/Tax";
import Emails from "./pages/admin/settings/Emails";
import Pdf from "./pages/admin/settings/Pdf";
import Translate from "./pages/admin/settings/Translate";
import Extras from "./pages/admin/settings/Extras";
import License from "./pages/admin/settings/License";

/* =========================================================
   CLIENT PORTAL
========================================================= */

import ClientDashboard from "./pages/client/Dashboard";
import ClientProjects from "./pages/client/Projects";
import ClientApprovals from "./pages/client/Approvals";
import ClientQuotes from "./pages/client/Quotes";
import ClientQuoteDetails from "./pages/client/QuoteDetails";
import ClientInvoices from "./pages/client/Invoices";
import ClientInvoiceDetails from "./pages/client/InvoiceDetails";
import ClientPayments from "./pages/client/Payments";
import ClientReceipts from "./pages/client/Receipts";
import ClientReceiptDetails from "./pages/client/ReceiptDetails";
import ClientDocuments from "./pages/client/Documents";
import ClientMessages from "./pages/client/Messages";
import ClientTickets from "./pages/client/Tickets";
import ClientTicketDetails from "./pages/client/TicketDetails";
import ClientProfile from "./pages/client/Profile";

// Client Checkout
import PaymentCheckout from "./pages/client/payments/PaymentCheckout";
import PaymentSuccess from "./pages/client/payments/PaymentSuccess";
import PaymentFailed from "./pages/client/payments/PaymentFailed";

/* =========================================================
   COMMON & ERRORS
========================================================= */

import Profile from "./pages/profile/Profile";
import System from "./pages/system/System";
import Unauthorized from "./pages/errors/Unauthorized";
import Forbidden from "./pages/errors/Forbidden";
import NotFound from "./pages/errors/NotFound";
import ServerError from "./pages/errors/ServerError";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    // Automatically dismiss any existing toasts whenever navigating between routes
    toast.dismiss();
  }, [location.pathname]);
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* =====================================================
          PROTECTED ROUTES
      ===================================================== */}
      <Route element={<ProtectedRoute />}>

        {/* ===================================================
            SUPER ADMIN PANEL (/super-admin/* & /superadmin/*)
        =================================================== */}
        <Route element={<SuperAdminRoute />}>
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="tenants" element={<SuperAdminTenants />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
            <Route path="plans" element={<SuperAdminPlans />} />
            <Route path="payments" element={<SuperAdminPayments />} />
            <Route path="invoices" element={<SuperAdminInvoices />} />
            <Route path="projects" element={<SuperAdminProjects />} />
            <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
            <Route path="notifications" element={<SuperAdminNotifications />} />
            <Route path="settings" element={<SuperAdminSettings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="integrations" element={<SuperAdminIntegrations />} />
            <Route path="tickets" element={<SuperAdminTickets />} />
            <Route path="reports" element={<SuperAdminReports />} />
            <Route path="system-health" element={<SuperAdminSystemHealth />} />
          </Route>

          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="tenants" element={<SuperAdminTenants />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
            <Route path="plans" element={<SuperAdminPlans />} />
            <Route path="payments" element={<SuperAdminPayments />} />
            <Route path="invoices" element={<SuperAdminInvoices />} />
            <Route path="projects" element={<SuperAdminProjects />} />
            <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
            <Route path="notifications" element={<SuperAdminNotifications />} />
            <Route path="settings" element={<SuperAdminSettings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="integrations" element={<SuperAdminIntegrations />} />
            <Route path="tickets" element={<SuperAdminTickets />} />
            <Route path="reports" element={<SuperAdminReports />} />
            <Route path="system-health" element={<SuperAdminSystemHealth />} />
          </Route>
        </Route>

        {/* ===================================================
            ADMIN PANEL (/admin/*)
        =================================================== */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* PROJECTS & OPERATIONS */}
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="tasks" element={<TaskList />} />
            <Route path="deliverables" element={<DeliverableList />} />
            <Route path="deliverables/:id" element={<DeliverableDetails />} />

            {/* VENDORS */}
            <Route path="vendors" element={<VendorList />} />
            <Route path="vendors/add" element={<AddVendor />} />
            <Route path="vendors/:id/edit" element={<EditVendor />} />
            <Route path="vendors/:id" element={<ViewVendor />} />

            {/* QUOTES */}
            <Route path="quotes" element={<QuoteList />} />
            <Route path="quotes/add" element={<AddQuote />} />
            <Route path="quotes/:id/edit" element={<EditQuote />} />
            <Route path="quotes/:id" element={<QuoteDetails />} />

            {/* INVOICES */}
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoices/add" element={<AddInvoice />} />
            <Route path="invoices/:id/edit" element={<EditInvoice />} />
            <Route path="invoices/:id" element={<InvoiceDetails />} />

            {/* PAYMENTS */}
            <Route path="payments" element={<PaymentList />} />
            <Route path="payments/:id" element={<PaymentDetails />} />

            {/* DOCUMENTS & MESSAGES */}
            <Route path="documents" element={<DocumentList />} />
            <Route path="messages" element={<MessageCenter />} />

            {/* REPORTS & TICKETS */}
            <Route path="reports" element={<ReportDashboard />} />
            <Route path="tickets" element={<AdminTicketList />} />
            <Route path="tickets/:id" element={<AdminTicketDetails />} />
            <Route path="subscription" element={<SubscriptionUpgrade />} />
            <Route path="notifications" element={<AdminNotificationList />} />

            {/* PROFILE & SYSTEM */}
            <Route path="profile" element={<Profile />} />
            <Route path="system" element={<System />} />

            {/* SETTINGS */}
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<SettingsHub />} />
              <Route path="general" element={<General />} />
              <Route path="business" element={<Business />} />
              <Route path="quotation" element={<Quotation />} />
              <Route path="invoice" element={<Invoice />} />
              <Route path="payments" element={<Payments />} />
              <Route path="tax" element={<Tax />} />
              <Route path="emails" element={<Emails />} />
              <Route path="pdf" element={<Pdf />} />
              <Route path="translate" element={<Translate />} />
              <Route path="extras" element={<Extras />} />
              <Route path="license" element={<License />} />
            </Route>
          </Route>
        </Route>

        {/* CLIENTS - Accessible to all authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/clients" element={<ClientList />} />
          <Route path="/admin/clients/add" element={<AddClient />} />
          <Route path="/admin/clients/:id/edit" element={<EditClient />} />
          <Route path="/admin/clients/:id" element={<ViewClient />} />
        </Route>

        {/* ===================================================
            VENDOR PANEL (/vendor/*)
        =================================================== */}
        <Route element={<VendorRoute />}>
          <Route path="/vendor" element={<VendorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="projects" element={<VendorProjects />} />
            <Route path="tasks" element={<VendorTasks />} />
            <Route path="deliverables" element={<VendorDeliverables />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="invoices" element={<VendorInvoices />} />
            <Route path="payments" element={<VendorPayments />} />
            <Route path="documents" element={<VendorDocuments />} />
            <Route path="messages" element={<VendorMessages />} />
            <Route path="profile" element={<VendorProfile />} />
          </Route>
        </Route>

        {/* ===================================================
            CLIENT PANEL (/client/*)
        =================================================== */}
        <Route element={<ClientRoute />}>
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="projects" element={<ClientProjects />} />
            <Route path="approvals" element={<ClientApprovals />} />
            <Route path="quotes" element={<ClientQuotes />} />
            <Route path="quotes/:id" element={<ClientQuoteDetails />} />
            <Route path="invoices" element={<ClientInvoices />} />
            <Route path="invoices/:id" element={<ClientInvoiceDetails />} />
            <Route path="payments" element={<ClientPayments />} />
            <Route path="payments/checkout/:invoiceId" element={<PaymentCheckout />} />
            <Route path="payments/success" element={<PaymentSuccess />} />
            <Route path="payments/failed" element={<PaymentFailed />} />
            <Route path="receipts" element={<ClientReceipts />} />
            <Route path="receipts/:id" element={<ClientReceiptDetails />} />
            <Route path="documents" element={<ClientDocuments />} />
            <Route path="messages" element={<ClientMessages />} />
            <Route path="tickets" element={<ClientTickets />} />
            <Route path="tickets/:id" element={<ClientTicketDetails />} />
            <Route path="profile" element={<ClientProfile />} />
          </Route>
        </Route>
      </Route>

      {/* =====================================================
          ERROR ROUTES & 404
      ===================================================== */}
      <Route path="/401" element={<Unauthorized />} />
      <Route path="/403" element={<Forbidden />} />
      <Route path="/500" element={<ServerError />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}