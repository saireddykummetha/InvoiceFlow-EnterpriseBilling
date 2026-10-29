import api from "./api.js";

// ============================================================
// DASHBOARD REPORT
// ============================================================

export async function getReportDashboard(params = {}) {
  const response = await api.get("reports/dashboard/", { params });
  return response.data?.data ?? response.data;
}

// ============================================================
// SALES REPORT
// ============================================================

export async function getSalesReport(params = {}) {
  const response = await api.get("reports/sales/", { params });
  return response.data?.data ?? response.data;
}

// ============================================================
// PAYMENTS REPORT
// ============================================================

export async function getPaymentsReport(params = {}) {
  const response = await api.get("reports/payments/", { params });
  return response.data?.data ?? response.data;
}

// ============================================================
// TAX REPORT
// ============================================================

export async function getTaxReport(params = {}) {
  const response = await api.get("reports/tax/", { params });
  return response.data?.data ?? response.data;
}

// ============================================================
// CLIENT REPORT
// ============================================================

export async function getClientsReport(params = {}) {
  const response = await api.get("reports/clients/", { params });
  return response.data?.data ?? response.data;
}

// ============================================================
// PROFIT / LOSS
// ============================================================

export async function getProfitLossReport(params = {}) {
  const response = await api.get("reports/profit-loss/", { params });
  return response.data?.data ?? response.data;
}

export default {
  getReportDashboard,
  getSalesReport,
  getPaymentsReport,
  getTaxReport,
  getClientsReport,
  getProfitLossReport,
};