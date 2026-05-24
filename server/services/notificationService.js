const Notification = require("../models/Notification");

async function createNotification({ userId, type, title, message, meta = {} }) {
  return Notification.create({
    userId,
    type,
    title,
    message,
    meta,
  });
}

async function getUserNotifications(userId, limit = 20) {
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
}

async function markAsRead(userId, notificationId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
}

async function markAllAsRead(userId) {
  return Notification.updateMany({ userId, read: false }, { read: true });
}

async function getUnreadCount(userId) {
  return Notification.countDocuments({ userId, read: false });
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
