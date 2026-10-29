import api from "./api.js";

// ============================================================
// GET ALL VENDORS
// ============================================================

export async function getVendors(params = {}) {
  const response = await api.get("vendors/", { params });
  return response.data?.data ?? response.data;
}

// ============================================================
// GET VENDOR STATS
// ============================================================

export async function getVendorStats() {
  const response = await api.get("vendors/stats/");
  return response.data?.data ?? response.data;
}

// ============================================================
// GET ONE VENDOR
// ============================================================

export async function getVendor(id) {
  if (!id) throw new Error("Vendor ID is required.");
  const response = await api.get(`vendors/${id}/`);
  return response.data?.data ?? response.data;
}

// ============================================================
// CREATE VENDOR
// ============================================================

export async function createVendor(data) {
  const response = await api.post("vendors/", data);
  return response.data;
}

// ============================================================
// UPDATE VENDOR
// ============================================================

export async function updateVendor(id, data) {
  if (!id) throw new Error("Vendor ID is required.");
  const response = await api.patch(`vendors/${id}/`, data);
  return response.data;
}

// ============================================================
// DELETE VENDOR
// ============================================================

export async function deleteVendor(id) {
  if (!id) throw new Error("Vendor ID is required.");
  const response = await api.delete(`vendors/${id}/`);
  return response.data;
}

export default {
  getVendors,
  getVendorStats,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
};
