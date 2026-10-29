import {
  getDashboard,
  getDashboardSummary,
  getRecentInvoices,
  getRecentPayments,
  search,
} from "../api/dashboard.js";

export const dashboardService = {
  get: getDashboard,
  getSummary: getDashboardSummary,
  getRecentInvoices,
  getRecentPayments,
  search,
};

export default dashboardService;