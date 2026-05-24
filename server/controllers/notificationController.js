const asyncHandler = require("../middleware/asyncHandler");
const notificationService = require("../services/notificationService");

exports.getNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.getUserNotifications(
    req.user._id,
    Number(req.query.limit) || 30
  );
  res.json({ success: true, data });
});

exports.markRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markAsRead(
    req.user._id,
    req.params.id
  );
  res.json({ success: true, data });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.json({ success: true });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  res.json({ success: true, count });
});
