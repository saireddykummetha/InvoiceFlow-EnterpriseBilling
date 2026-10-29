import api from "./api.js";

// ============================================================
// GET ALL INVOICES
// ============================================================

export async function getInvoices(params = {}) {
  const response = await api.get("invoices/", { params });
  return response.data?.data ?? response.data;
}

// ============================================================
// GET ONE INVOICE
// ============================================================

export async function getInvoice(id) {
  if (!id) throw new Error("Invoice ID is required.");
  const response = await api.get(`invoices/${id}/`);
  return response.data?.data ?? response.data;
}

// ============================================================
// CREATE INVOICE
// ============================================================

export async function createInvoice(data) {
  const response = await api.post("invoices/", data);
  return response.data?.data ?? response.data;
}

// ============================================================
// UPDATE INVOICE
// ============================================================

export async function updateInvoice(id, data) {
  if (!id) throw new Error("Invoice ID is required.");
  const response = await api.patch(`invoices/${id}/`, data);
  return response.data?.data ?? response.data;
}

// ============================================================
// DELETE INVOICE
// ============================================================

export async function deleteInvoice(id) {
  if (!id) throw new Error("Invoice ID is required.");
  const response = await api.delete(`invoices/${id}/`);
  return response.data;
}

// ============================================================
// CREATE INVOICE FROM QUOTE
// ============================================================

export async function createInvoiceFromQuote(data) {
  const payload = typeof data === "object" ? data : { quote_id: data };
  const response = await api.post("invoices/from-quote/", payload);
  return response.data?.data ?? response.data;
}

// ============================================================
// INVOICE PDF DOWNLOAD
// ============================================================

export async function downloadInvoicePdf(id, filename = `invoice_${id}.pdf`, template = null) {
  if (!id) throw new Error("Invoice ID is required.");

  const params = {};
  if (template) params.template = template;

  const response = await api.get(`invoices/${id}/pdf/`, {
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

// ============================================================
// SEND INVOICE
// ============================================================

export async function sendInvoice(id, data = {}) {
  if (!id) throw new Error("Invoice ID is required.");
  const response = await api.post(`invoices/${id}/send/`, data);
  return response.data;
}

export default {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  createInvoiceFromQuote,
  downloadInvoicePdf,
  sendInvoice,
};