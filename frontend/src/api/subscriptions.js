import api from "./api";

export const getSubscriptions = async (params = {}) => {
  const response = await api.get("subscriptions/", { params });
  return response.data;
};

export const getSubscription = async (id) => {
  const response = await api.get(`subscriptions/${id}/`);
  return response.data;
};

export const createSubscription = async (data) => {
  const response = await api.post("subscriptions/", data);
  return response.data;
};

export const updateSubscription = async (id, data) => {
  const response = await api.patch(`subscriptions/${id}/`, data);
  return response.data;
};
