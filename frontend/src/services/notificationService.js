import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../api/notifications.js";

export const notificationService = {
  getAll: getNotifications,
  markRead: markNotificationRead,
  markAllRead: markAllNotificationsRead,
  remove: deleteNotification,
};

export default notificationService;
