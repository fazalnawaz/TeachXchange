const asyncHandler = require("../middleware/asyncHandler");
const sessionService = require("../services/sessionService");

exports.getSessions = asyncHandler(async (req, res) => {
  const data = await sessionService.getMySessions(req.user._id, {
    status: req.query.status,
    upcoming: req.query.upcoming === "true",
  });
  res.json({ success: true, data });
});

exports.getSession = asyncHandler(async (req, res) => {
  const data = await sessionService.getSessionById(req.params.id, req.user._id);
  res.json({ success: true, data });
});

exports.scheduleSession = asyncHandler(async (req, res) => {
  const session = await sessionService.scheduleSession({
    userId: req.user._id,
    partnerId: req.body.partnerId,
    title: req.body.title,
    scheduledAt: req.body.scheduledAt,
    durationMinutes: req.body.durationMinutes,
    teachSkill: req.body.teachSkill,
    learnSkill: req.body.learnSkill,
    notes: req.body.notes,
  });
  res.status(201).json({ success: true, data: session });
});

exports.confirmSession = asyncHandler(async (req, res) => {
  const session = await sessionService.confirmSession(req.params.id, req.user._id);
  res.json({ success: true, data: session });
});

exports.startSession = asyncHandler(async (req, res) => {
  const session = await sessionService.startSession(req.params.id, req.user._id);
  res.json({ success: true, data: session });
});

exports.completeSession = asyncHandler(async (req, res) => {
  const session = await sessionService.completeSession(req.params.id, req.user._id);
  res.json({ success: true, data: session });
});

exports.getZegoToken = asyncHandler(async (req, res) => {
  const session = await sessionService.getSessionById(req.params.id, req.user._id);
  res.json({
    success: true,
    data: {
      roomId: session.roomId,
      appId: process.env.ZEGO_APP_ID || "",
      serverSecret: process.env.ZEGO_SERVER_SECRET ? "***configured***" : "",
      userId: String(req.user._id),
      userName: `${req.user.firstName} ${req.user.lastName}`.trim(),
    },
  });
});
