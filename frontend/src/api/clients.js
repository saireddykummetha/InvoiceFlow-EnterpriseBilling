import api from "./api.js";

// ============================================================
// GET ALL CLIENTS
// ============================================================

export async function getClients(params = {}) {
  const response = await api.get("clients/", { params });
  console.log("Get clients response:", response);
  return response.data?.data ?? response.data ?? response?.results ?? response;
}

// ============================================================
// GET ONE CLIENT
// ============================================================

export async function getClient(id) {
  if (!id) throw new Error("Client ID is required.");
  const response = await api.get(`clients/${id}/`);
  return response.data?.data ?? response.data;
}

// ============================================================
// CREATE CLIENT
// ============================================================

export async function createClient(data) {
  const response = await api.post("clients/", data);
  return response.data;
}

// ============================================================
// UPDATE CLIENT
// ============================================================

export async function updateClient(id, data) {
  if (!id) throw new Error("Client ID is required.");
  const response = await api.patch(`clients/${id}/`, data);
  return response.data;
}

// ============================================================
// DELETE CLIENT
// ============================================================

export async function deleteClient(id) {
  if (!id) throw new Error("Client ID is required.");
  const response = await api.delete(`clients/${id}/`);
  return response.data;
}

// ============================================================
// CLIENT PORTAL CREDENTIALS
// ============================================================

export async function generateClientCredentials(id, password = "") {
  if (!id) throw new Error("Client ID is required.");
  const response = await api.post(`clients/${id}/credentials/`, { password });
  return response.data;
}

export async function getClientPortalStatus(id) {
  if (!id) throw new Error("Client ID is required.");
  const response = await api.get(`clients/${id}/credentials/`);
  return response.data?.data ?? response.data;
}

export default {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  generateClientCredentials,
  getClientPortalStatus,
};
