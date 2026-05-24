const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const {
  ensureAcceptedConnection,
  ensureConversationForConnection,
  syncConnectionsFromAcceptedMatches,
} = require("./connectionService");
const { createNotification } = require("./notificationService");
const { getIO } = require("./socketService");

function formatUserName(user) {
  if (!user) return "User";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
}

async function ensureConversationAccess(conversationId, userId) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Conversation not found");
  const allowed = conversation.participants.some(
    (p) => String(p) === String(userId)
  );
  if (!allowed) throw new Error("Not allowed in this conversation");
  return conversation;
}

async function getConversations(userId) {
  await syncConnectionsFromAcceptedMatches(userId);

  const conversations = await Conversation.find({
    participants: userId,
  })
    .sort({ updatedAt: -1 })
    .populate("participants", "firstName lastName bio rating")
    .lean();

  return conversations.map((conv) => {
    const partner = conv.participants.find(
      (p) => String(p._id) !== String(userId)
    );
    const unread =
      conv.unreadCounts?.[String(userId)] ??
      (conv.unreadCounts instanceof Map
        ? conv.unreadCounts.get(String(userId))
        : 0) ??
      0;

    return {
      _id: conv._id,
      connectionId: conv.connectionId,
      partner: partner
        ? {
            _id: partner._id,
            name: `${partner.firstName} ${partner.lastName}`.trim(),
            bio: partner.bio,
            rating: partner.rating,
          }
        : null,
      lastMessage: conv.lastMessage,
      unreadCount: unread || 0,
      updatedAt: conv.updatedAt,
    };
  });
}

async function getOrCreateConversation(userId, partnerId) {
  const connection = await ensureAcceptedConnection(userId, partnerId);
  if (!connection) {
    throw new Error("You must be connected with this user to chat");
  }

  return ensureConversationForConnection(connection);
}

async function getMessages(conversationId, userId, { limit = 50, before } = {}) {
  await ensureConversationAccess(conversationId, userId);

  const query = { conversationId };
  if (before) query.createdAt = { $lt: new Date(before) };

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("senderId", "firstName lastName")
    .lean();

  await Message.updateMany(
    { conversationId, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );

  const conversation = await Conversation.findById(conversationId);
  if (conversation?.unreadCounts) {
    conversation.unreadCounts.set(String(userId), 0);
    await conversation.save();
  }

  return messages.reverse().map((m) => ({
    _id: m._id,
    text: m.text,
    createdAt: m.createdAt,
    senderId: m.senderId?._id || m.senderId,
    senderName: m.senderId
      ? `${m.senderId.firstName || ""} ${m.senderId.lastName || ""}`.trim()
      : "User",
    isMine: String(m.senderId?._id || m.senderId) === String(userId),
  }));
}

async function sendMessage({ conversationId, senderId, text }) {
  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("Message cannot be empty");

  const conversation = await ensureConversationAccess(conversationId, senderId);
  const recipientId = conversation.participants.find(
    (p) => String(p) !== String(senderId)
  );

  const message = await Message.create({
    conversationId,
    senderId,
    text: trimmed,
    readBy: [senderId],
  });

  conversation.lastMessage = {
    text: trimmed,
    senderId,
    createdAt: message.createdAt,
  };
  const currentUnread =
    conversation.unreadCounts?.get?.(String(recipientId)) ||
    conversation.unreadCounts?.[String(recipientId)] ||
    0;
  if (conversation.unreadCounts?.set) {
    conversation.unreadCounts.set(String(recipientId), currentUnread + 1);
  } else {
    conversation.unreadCounts = conversation.unreadCounts || new Map();
    conversation.unreadCounts.set(String(recipientId), currentUnread + 1);
  }
  await conversation.save();

  const sender = await User.findById(senderId).select("firstName lastName");
  const payload = {
    _id: message._id,
    conversationId,
    text: trimmed,
    createdAt: message.createdAt,
    senderId,
    senderName: formatUserName(sender),
    isMine: false,
  };

  await createNotification({
    userId: recipientId,
    type: "chat_message",
    title: "New message",
    message: `${formatUserName(sender)}: ${trimmed.slice(0, 80)}`,
    meta: { conversationId, senderId },
  });

  try {
    const io = getIO();
    // Exclude sender — they already get the message via the socket ack callback
    io.to(`conversation:${conversationId}`)
      .except(`user:${senderId}`)
      .emit("chat:message", payload);
    io.to(`user:${recipientId}`).emit("chat:message", {
      ...payload,
      unreadCount: currentUnread + 1,
    });
    io.to(`user:${recipientId}`).emit("notification:new", { type: "chat_message" });
  } catch {
    // ignore
  }

  return { ...payload, isMine: true };
}

async function getUnreadTotal(userId) {
  const conversations = await Conversation.find({ participants: userId });
  return conversations.reduce((sum, conv) => {
    const count =
      conv.unreadCounts?.get?.(String(userId)) ??
      conv.unreadCounts?.[String(userId)] ??
      0;
    return sum + count;
  }, 0);
}

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getUnreadTotal,
  ensureConversationAccess,
};
