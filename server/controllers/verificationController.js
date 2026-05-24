const verificationService = require("../services/verificationService");
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require("../services/notificationService");
const User = require("../models/User");

exports.getStats = async (req, res) => {
  const stats = await verificationService.getVerificationStats(req.user._id);
  res.json(stats);
};

exports.getUnverifiedSkills = async (req, res) => {
  const user = await User.findById(req.user._id).select("skills");
  const unverified = (user?.skills || []).filter((s) => !s.verified);
  res.json(unverified);
};

exports.getAllSkills = async (req, res) => {
  const user = await User.findById(req.user._id).select("skills");
  res.json(user?.skills || []);
};

exports.startQuiz = async (req, res) => {
  const { skillId } = req.body;
  if (!skillId) {
    return res.status(400).json({ message: "skillId is required" });
  }

  const quiz = await verificationService.startQuiz(req.user._id, skillId);
  res.status(201).json(quiz);
};

exports.submitQuiz = async (req, res) => {
  const { attemptId, answers, timeTakenSeconds } = req.body;

  if (!attemptId || !Array.isArray(answers)) {
    return res.status(400).json({
      message: "attemptId and answers array are required",
    });
  }

  const result = await verificationService.submitQuiz(
    req.user._id,
    attemptId,
    answers,
    timeTakenSeconds
  );

  res.json(result);
};

exports.getNotifications = async (req, res) => {
  const notifications = await getUserNotifications(req.user._id);
  const unreadCount = await getUnreadCount(req.user._id);
  res.json({ notifications, unreadCount });
};

exports.markNotificationRead = async (req, res) => {
  const notification = await markAsRead(req.user._id, req.params.id);
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  res.json(notification);
};

exports.markAllNotificationsRead = async (req, res) => {
  await markAllAsRead(req.user._id);
  res.json({ message: "All notifications marked as read" });
};
