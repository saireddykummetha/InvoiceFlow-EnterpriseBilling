import api from "./api";

export const getTasks = async (params = {}) => {
  const response = await api.get("tasks/", { params });
  return response.data;
};

export const getTask = async (id) => {
  const response = await api.get(`tasks/${id}/`);
  return response.data;
};

export const createTask = async (data) => {
  const response = await api.post("tasks/", data);
  return response.data;
};

export const updateTask = async (id, data) => {
  const response = await api.patch(`tasks/${id}/`, data);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`tasks/${id}/`);
  return response.data;
};

export const addTaskComment = async (taskId, data) => {
  const isFormData = data instanceof FormData;
  const headers = isFormData ? { "Content-Type": "multipart/form-data" } : {};
  const response = await api.post(`tasks/${taskId}/comments/`, data, { headers });
  return response.data;
};
