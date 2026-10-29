import api from "./api.js";

// ============================================================
// GET ALL TICKETS
// ============================================================

export async function getTickets(params = {}) {
  const response = await api.get("tickets/", { params });
  return response.data?.data ?? response.data;
}

// ============================================================
// GET ONE TICKET
// ============================================================

export async function getTicket(id) {
  if (!id) throw new Error("Ticket ID is required.");
  const response = await api.get(`tickets/${id}/`);
  return response.data?.data ?? response.data;
}

// ============================================================
// CREATE TICKET
// ============================================================

export async function createTicket(data) {
  const isFormData = data instanceof FormData;
  const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
  const response = await api.post("tickets/", data, config);
  return response.data?.data ?? response.data;
}

// ============================================================
// UPDATE TICKET
// ============================================================

export async function updateTicket(id, data) {
  if (!id) throw new Error("Ticket ID is required.");
  const response = await api.patch(`tickets/${id}/`, data);
  return response.data?.data ?? response.data;
}

// ============================================================
// DELETE TICKET
// ============================================================

export async function deleteTicket(id) {
  if (!id) throw new Error("Ticket ID is required.");
  const response = await api.delete(`tickets/${id}/`);
  return response.data;
}

// ============================================================
// REPLY ON TICKET
// ============================================================

export async function replyTicket(id, data) {
  if (!id) throw new Error("Ticket ID is required.");
  const isFormData = data instanceof FormData;
  const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
  const response = await api.post(`tickets/${id}/reply/`, data, config);
  return response.data?.data ?? response.data;
}
