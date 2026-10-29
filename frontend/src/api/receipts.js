import api from "./api.js";

// ============================================================
// GET ALL RECEIPTS
// ============================================================

export async function getReceipts(params = {}) {
  const response = await api.get("receipts/", { params });
  return response.data?.data ?? response.data;
}

// ============================================================
// GET ONE RECEIPT
// ============================================================

export async function getReceipt(id) {
  if (!id) throw new Error("Receipt ID is required.");
  const response = await api.get(`receipts/${id}/`);
  return response.data?.data ?? response.data;
}

// ============================================================
// RECEIPT PDF DOWNLOAD
// ============================================================

export async function downloadReceiptPdf(id, filename = `receipt_${id}.pdf`) {
  if (!id) throw new Error("Receipt ID is required.");

  const response = await api.get(`receipts/${id}/pdf/`, {
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
  getReceipts,
  getReceipt,
  downloadReceiptPdf,
};