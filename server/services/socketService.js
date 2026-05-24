const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

let io = null;
const onlineUsers = new Map();

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST", "PATCH"],
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.userId);
    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    io.emit("presence:update", { userId, online: true });

    socket.on("conversation:join", ({ conversationId }) => {
      if (conversationId) socket.join(`conversation:${conversationId}`);
    });

    socket.on("conversation:leave", ({ conversationId }) => {
      if (conversationId) socket.leave(`conversation:${conversationId}`);
    });

    socket.on("chat:typing", async ({ conversationId, isTyping }) => {
      try {
        const chatService = require("./chatService");
        await chatService.ensureConversationAccess(conversationId, userId);
        socket.to(`conversation:${conversationId}`).emit("chat:typing", {
          conversationId,
          userId,
          isTyping: Boolean(isTyping),
        });
      } catch {
        // ignore
      }
    });

    socket.on("chat:send", async ({ conversationId, text }, ack) => {
      try {
        const chatService = require("./chatService");
        const message = await chatService.sendMessage({
          conversationId,
          senderId: userId,
          text,
        });
        if (typeof ack === "function") ack({ success: true, message });
      } catch (err) {
        if (typeof ack === "function") ack({ success: false, error: err.message });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("presence:update", { userId, online: false });
    });
  });

  return io;
}

function isUserOnline(userId) {
  return onlineUsers.has(String(userId));
}

function getOnlineUserIds() {
  return Array.from(onlineUsers.keys());
}

module.exports = { initSocket, getIO, isUserOnline, getOnlineUserIds };
