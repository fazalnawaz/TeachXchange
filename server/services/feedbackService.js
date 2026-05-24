const Feedback = require("../models/Feedback");
const LearningSession = require("../models/LearningSession");
const User = require("../models/User");
const { createNotification } = require("./notificationService");
const {
  awardFeedbackPoints,
  recalculateUserRating,
} = require("./gamificationService");

async function submitFeedback({ sessionId, fromUserId, toUserId, rating, comment }) {
  const session = await LearningSession.findById(sessionId);
  if (!session) throw new Error("Session not found");
  if (session.status !== "completed") {
    throw new Error("Feedback is only available after session completion");
  }
  if (!session.participants.some((p) => String(p) === String(fromUserId))) {
    throw new Error("Not allowed");
  }
  if (!session.participants.some((p) => String(p) === String(toUserId))) {
    throw new Error("Invalid recipient");
  }
  if (String(fromUserId) === String(toUserId)) {
    throw new Error("Cannot rate yourself");
  }

  const existing = await Feedback.findOne({ sessionId, fromUserId });
  if (existing) throw new Error("You already submitted feedback for this session");

  const feedback = await Feedback.create({
    sessionId,
    fromUserId,
    toUserId,
    rating,
    comment: comment || "",
  });

  const fromUser = await User.findById(fromUserId);
  await awardFeedbackPoints(fromUser);
  await recalculateUserRating(toUserId);

  await createNotification({
    userId: toUserId,
    type: "feedback_received",
    title: "New feedback",
    message: `${fromUser.firstName} rated you ${rating}/5`,
    meta: { sessionId, rating },
  });

  return feedback;
}

async function getSessionFeedback(sessionId, userId) {
  const session = await LearningSession.findById(sessionId);
  if (!session) throw new Error("Session not found");
  if (!session.participants.some((p) => String(p) === String(userId))) {
    throw new Error("Not allowed");
  }

  const feedbacks = await Feedback.find({ sessionId })
    .populate("fromUserId", "firstName lastName")
    .lean();

  return feedbacks.map((f) => ({
    _id: f._id,
    rating: f.rating,
    comment: f.comment,
    fromUserId: f.fromUserId._id,
    fromName: `${f.fromUserId.firstName} ${f.fromUserId.lastName}`.trim(),
    isMine: String(f.fromUserId._id) === String(userId),
  }));
}

module.exports = { submitFeedback, getSessionFeedback };
