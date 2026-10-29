import {
  getReportDashboard,
  getSalesReport,
  getPaymentsReport,
  getTaxReport,
  getClientsReport,
  getProfitLossReport,
} from "../api/reports.js";

export const reportService = {
  dashboard: getReportDashboard,
  sales: getSalesReport,
  payments: getPaymentsReport,
  tax: getTaxReport,
  clients: getClientsReport,
  profitLoss: getProfitLossReport,
};

export default reportService;