const asyncHandler = require("../middleware/asyncHandler");
const feedbackService = require("../services/feedbackService");

exports.submitFeedback = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.submitFeedback({
    sessionId: req.params.sessionId,
    fromUserId: req.user._id,
    toUserId: req.body.toUserId,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  res.status(201).json({ success: true, data: feedback });
});

exports.getSessionFeedback = asyncHandler(async (req, res) => {
  const data = await feedbackService.getSessionFeedback(
    req.params.sessionId,
    req.user._id
  );
  res.json({ success: true, data });
});
