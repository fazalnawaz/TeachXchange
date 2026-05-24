const asyncHandler = require("../middleware/asyncHandler");
const chatService = require("../services/chatService");
exports.getConversations = asyncHandler(async (req, res) => {
  const data = await chatService.getConversations(req.user._id);
  let onlineIds = [];
  try {
    onlineIds = require("../services/socketService").getOnlineUserIds();
  } catch {
    // socket not ready
  }
  const enriched = data.map((c) => ({
    ...c,
    partnerOnline: c.partner ? onlineIds.includes(String(c.partner._id)) : false,
  }));
  res.json({ success: true, data: enriched });
});

exports.getMessages = asyncHandler(async (req, res) => {
  const data = await chatService.getMessages(
    req.params.conversationId,
    req.user._id,
    { limit: Number(req.query.limit) || 50, before: req.query.before }
  );
  res.json({ success: true, data });
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const message = await chatService.sendMessage({
    conversationId: req.params.conversationId,
    senderId: req.user._id,
    text: req.body.text,
  });
  res.status(201).json({ success: true, data: message });
});

exports.startConversation = asyncHandler(async (req, res) => {
  const conversation = await chatService.getOrCreateConversation(
    req.user._id,
    req.body.partnerId
  );
  res.json({ success: true, data: conversation });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await chatService.getUnreadTotal(req.user._id);
  res.json({ success: true, count });
});
