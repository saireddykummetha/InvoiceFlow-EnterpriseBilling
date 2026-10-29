import api from "./api.js";

// ============================================================
// DASHBOARD
// ============================================================

export async function getDashboard() {
  const response = await api.get("dashboard/");
  return response.data?.data ?? response.data;
}

// ============================================================
// DASHBOARD SUMMARY
// ============================================================

export async function getDashboardSummary() {
  const response = await api.get("dashboard/summary/");
  return response.data?.data ?? response.data;
}

// ============================================================
// RECENT INVOICES
// ============================================================

export async function getRecentInvoices() {
  const response = await api.get("dashboard/recent-invoices/");
  return response.data?.data ?? response.data;
}

// ============================================================
// RECENT PAYMENTS
// ============================================================

export async function getRecentPayments() {
  const response = await api.get("dashboard/recent-payments/");
  return response.data?.data ?? response.data;
}

// ============================================================
// GLOBAL SEARCH
// ============================================================

export async function search(query) {
  const response = await api.get("dashboard/search/", {
    params: { q: query },
  });
  return response.data?.data ?? response.data;
}

export default {
  getDashboard,
  getDashboardSummary,
  getRecentInvoices,
  getRecentPayments,
  search,
};
