import api from "./api";

export const getDeliverables = async (params = {}) => {
  const response = await api.get("deliverables/", { params });
  return response.data;
};

export const getDeliverable = async (id) => {
  const response = await api.get(`deliverables/${id}/`);
  return response.data;
};

export const createDeliverable = async (data) => {
  const isFormData = data instanceof FormData;
  const headers = isFormData ? { "Content-Type": "multipart/form-data" } : {};
  const response = await api.post("deliverables/", data, { headers });
  return response.data;
};

export const updateDeliverable = async (id, data) => {
  const response = await api.patch(`deliverables/${id}/`, data);
  return response.data;
};

export const deleteDeliverable = async (id) => {
  const response = await api.delete(`deliverables/${id}/`);
  return response.data;
};

export const adminReviewDeliverable = async (id, { action, feedback }) => {
  const response = await api.post(`deliverables/${id}/admin-review/`, { action, feedback });
  return response.data;
};

export const clientReviewDeliverable = async (id, { action, feedback }) => {
  const response = await api.post(`deliverables/${id}/client-review/`, { action, feedback });
  return response.data;
};
