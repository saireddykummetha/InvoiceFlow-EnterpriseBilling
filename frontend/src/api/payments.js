import api from "./api.js";

// ============================================================
// GET ALL PAYMENTS
// ============================================================

export async function getPayments(params = {}) {
  const response = await api.get("payments/", { params });
  return response.data?.data ?? response.data;
}

// ============================================================
// GET ONE PAYMENT
// ============================================================

export async function getPayment(id) {
  if (!id) throw new Error("Payment ID is required.");
  const response = await api.get(`payments/${id}/`);
  return response.data?.data ?? response.data;
}

// ============================================================
// CREATE PAYMENT
// ============================================================

export async function createPayment(data) {
  const response = await api.post("payments/", data);
  return response.data?.data ?? response.data;
}

// ============================================================
// UPDATE PAYMENT
// ============================================================

export async function updatePayment(id, data) {
  if (!id) throw new Error("Payment ID is required.");
  const response = await api.patch(`payments/${id}/`, data);
  return response.data?.data ?? response.data;
}

// ============================================================
// DELETE PAYMENT
// ============================================================

export async function deletePayment(id) {
  if (!id) throw new Error("Payment ID is required.");
  const response = await api.delete(`payments/${id}/`);
  return response.data;
}

// ============================================================
// MANUAL PAYMENT
// ============================================================

export async function createManualPayment(data) {
  const response = await api.post("payments/manual/", data);
  return response.data?.data ?? response.data;
}

export async function recordPayment(data) {
  const response = await api.post("payments/manual/", data);
  return response.data?.data ?? response.data;
}

// ============================================================
// CREATE RAZORPAY ORDER
// ============================================================

export async function createPaymentOrder(data) {
  const response = await api.post("payments/create-order/", data);
  return response.data?.data ?? response.data;
}

// ============================================================
// VERIFY RAZORPAY PAYMENT
// ============================================================

export async function verifyPayment(data) {
  const response = await api.post("payments/verify/", data);
  return response.data?.data ?? response.data;
}

export async function paymentWebhook(data) {
  const response = await api.post("payments/webhook/", data);
  return response.data;
}

export async function confirmPayment(id) {
  if (!id) throw new Error("Payment ID is required.");
  const response = await api.post(`payments/${id}/confirm/`);
  return response.data?.data ?? response.data;
}

// ============================================================
// CLEAN PENDING CHECKOUT ATTEMPTS
// ============================================================

export async function cleanPendingPayments() {
  const response = await api.post("payments/clean-pending/");
  return response.data;
}

export default {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  createManualPayment,
  createPaymentOrder,
  verifyPayment,
  confirmPayment,
  cleanPendingPayments,
  paymentWebhook,
};