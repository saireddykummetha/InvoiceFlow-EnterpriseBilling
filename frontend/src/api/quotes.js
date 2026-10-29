import api from "./api.js";

// ============================================================
// GET ALL QUOTES
// ============================================================

export async function getQuotes(params = {}) {
  const response = await api.get("quotes/", { params });
  return response.data?.data ?? response.data;
}

// ============================================================
// GET ONE QUOTE
// ============================================================

export async function getQuote(id) {
  if (!id) throw new Error("Quote ID is required.");
  const response = await api.get(`quotes/${id}/`);
  return response.data?.data ?? response.data;
}

// ============================================================
// CREATE QUOTE
// ============================================================

export async function createQuote(data) {
  const response = await api.post("quotes/", data);
  return response.data?.data ?? response.data;
}

// ============================================================
// UPDATE QUOTE
// ============================================================

export async function updateQuote(id, data) {
  if (!id) throw new Error("Quote ID is required.");
  const response = await api.patch(`quotes/${id}/`, data);
  return response.data?.data ?? response.data;
}

// ============================================================
// DELETE QUOTE
// ============================================================

export async function deleteQuote(id) {
  if (!id) throw new Error("Quote ID is required.");
  const response = await api.delete(`quotes/${id}/`);
  return response.data;
}

// ============================================================
// APPROVE QUOTE
// ============================================================

export async function approveQuote(id) {
  if (!id) throw new Error("Quote ID is required.");
  const response = await api.post(`quotes/${id}/approve/`);
  return response.data?.data ?? response.data;
}

// ============================================================
// REJECT QUOTE
// ============================================================

export async function rejectQuote(id) {
  if (!id) throw new Error("Quote ID is required.");
  const response = await api.post(`quotes/${id}/reject/`);
  return response.data?.data ?? response.data;
}

// ============================================================
// CONVERT QUOTE TO INVOICE
// ============================================================

export async function convertToInvoice(id) {
  if (!id) throw new Error("Quote ID is required.");
  const response = await api.post(`quotes/${id}/convert-to-invoice/`);
  return response.data?.data ?? response.data;
}

// ============================================================
// SYNC INVOICE FROM UPDATED QUOTE
// ============================================================

export async function syncInvoiceFromQuote(id) {
  if (!id) throw new Error("Quote ID is required.");
  const response = await api.post(`quotes/${id}/sync-invoice/`);
  return response.data?.data ?? response.data;
}

// ============================================================
// QUOTE PDF DOWNLOAD
// ============================================================

export async function downloadQuotePdf(id, filename = `quote_${id}.pdf`, template = null) {
  if (!id) throw new Error("Quote ID is required.");

  const params = {};
  if (template) params.template = template;

  const response = await api.get(`quotes/${id}/pdf/`, {
    params,
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return response;
}

export default {
  getQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
  approveQuote,
  rejectQuote,
  convertToInvoice,
  syncInvoiceFromQuote,
  downloadQuotePdf,
};