import api from "./api.js";

export async function getNotifications() {
  const response = await api.get("notifications/");
  return response.data;
}

export async function markNotificationRead(id) {
  const response = await api.patch(`notifications/${id}/`);
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await api.post("notifications/mark-all-read/");
  return response.data;
}

export async function deleteNotification(id) {
  const response = await api.delete(`notifications/${id}/`);
  return response.data;
}
