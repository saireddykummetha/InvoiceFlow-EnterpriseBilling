import api from "./api";

export const getDocuments = async (params = {}) => {
  const response = await api.get("documents/", { params });
  return response.data;
};

export const getDocument = async (id) => {
  const response = await api.get(`documents/${id}/`);
  return response.data;
};

export const createDocument = async (data) => {
  const isFormData = data instanceof FormData;
  const headers = isFormData ? { "Content-Type": "multipart/form-data" } : {};
  const response = await api.post("documents/", data, { headers });
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`documents/${id}/`);
  return response.data;
};
