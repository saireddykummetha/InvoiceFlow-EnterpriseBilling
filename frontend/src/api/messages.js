import api from "./api";

export const getMessages = async (params = {}) => {
  const response = await api.get("messages/", { params });
  return response.data;
};

export const sendMessage = async (data) => {
  const isFormData = data instanceof FormData;
  const headers = isFormData ? { "Content-Type": "multipart/form-data" } : {};
  const response = await api.post("messages/", data, { headers });
  return response.data;
};

export const markMessagesRead = async (payload) => {
  const response = await api.post("messages/mark-read/", payload);
  return response.data;
};
