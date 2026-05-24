const crypto = require("crypto");
const LearningSession = require("../models/LearningSession");
const User = require("../models/User");
const { ensureAcceptedConnection } = require("./connectionService");
const { createNotification } = require("./notificationService");
const { getIO } = require("./socketService");
const {
  awardSessionCompletion,
  recalculateUserRating,
} = require("./gamificationService");

function formatUserName(user) {
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Partner";
}

async function ensureConnection(userId, partnerId) {
  const connection = await ensureAcceptedConnection(userId, partnerId);
  if (!connection) throw new Error("You must be connected to schedule a session");
  return connection;
}

async function scheduleSession({
  userId,
  partnerId,
  title,
  scheduledAt,
  durationMinutes,
  teachSkill,
  learnSkill,
  notes,
}) {
  const connection = await ensureConnection(userId, partnerId);
  const creator = await User.findById(userId);
  const partner = await User.findById(partnerId);
  if (!creator || !partner) throw new Error("User not found");

  const roomId = `tx-${crypto.randomBytes(8).toString("hex")}`;
  const session = await LearningSession.create({
    connectionId: connection._id,
    createdBy: userId,
    participants: connection.participants,
    title: title || `Skill Exchange Session`,
    teachSkill: teachSkill || "",
    learnSkill: learnSkill || "",
    scheduledAt: new Date(scheduledAt),
    durationMinutes: durationMinutes || 60,
    status: "pending",
    confirmedBy: [userId],
    roomId,
    notes: notes || "",
  });

  const creatorName = formatUserName(creator);

  await createNotification({
    userId: partnerId,
    type: "session_scheduled",
    title: "Session proposed",
    message: `${creatorName} proposed a session on ${new Date(scheduledAt).toLocaleString()}`,
    meta: { sessionId: session._id, roomId },
  });

  try {
    const io = getIO();
    io.to(`user:${partnerId}`).emit("session:scheduled", { session });
    io.to(`user:${partnerId}`).emit("notification:new", { type: "session_scheduled" });
  } catch {
    // ignore
  }

  return session;
}

async function confirmSession(sessionId, userId) {
  const session = await LearningSession.findById(sessionId);
  if (!session) throw new Error("Session not found");
  if (!session.participants.some((p) => String(p) === String(userId))) {
    throw new Error("Not allowed");
  }

  if (!session.confirmedBy.some((p) => String(p) === String(userId))) {
    session.confirmedBy.push(userId);
  }

  if (session.confirmedBy.length >= 2) {
    session.status = "confirmed";
  }
  await session.save();

  const otherId = session.participants.find((p) => String(p) !== String(userId));
  const user = await User.findById(userId);

  await createNotification({
    userId: otherId,
    type: "session_confirmed",
    title: "Session confirmed",
    message: `${formatUserName(user)} confirmed the learning session`,
    meta: { sessionId: session._id },
  });

  try {
    const io = getIO();
    io.to(`user:${otherId}`).emit("session:confirmed", { session });
  } catch {
    // ignore
  }

  return session;
}

async function startSession(sessionId, userId) {
  const session = await LearningSession.findById(sessionId);
  if (!session) throw new Error("Session not found");
  if (!session.participants.some((p) => String(p) === String(userId))) {
    throw new Error("Not allowed");
  }
  if (!["pending", "confirmed"].includes(session.status)) {
    throw new Error("Session cannot be started");
  }
  session.status = "confirmed";
  session.startedAt = new Date();
  await session.save();
  return session;
}

async function completeSession(sessionId, userId) {
  const session = await LearningSession.findById(sessionId);
  if (!session) throw new Error("Session not found");
  if (!session.participants.some((p) => String(p) === String(userId))) {
    throw new Error("Not allowed");
  }
  if (session.status === "completed") return session;

  session.status = "completed";
  session.endedAt = new Date();
  await session.save();

  const [userA, userB] = await Promise.all(
    session.participants.map((id) => User.findById(id))
  );

  await Promise.all([
    awardSessionCompletion(userA, session),
    awardSessionCompletion(userB, session),
  ]);

  await Promise.all(
    session.participants.map((id) => recalculateUserRating(id))
  );

  await Promise.all(
    session.participants.map((pid) =>
      createNotification({
        userId: pid,
        type: "session_completed",
        title: "Session completed",
        message: "Leave feedback for your learning partner to earn bonus points",
        meta: { sessionId: session._id },
      })
    )
  );

  try {
    const io = getIO();
    session.participants.forEach((pid) => {
      io.to(`user:${pid}`).emit("session:completed", { sessionId: session._id });
    });
  } catch {
    // ignore
  }

  return session;
}

async function getMySessions(userId, { status, upcoming } = {}) {
  const filter = { participants: userId };
  if (status) filter.status = status;
  if (upcoming) {
    filter.scheduledAt = { $gte: new Date() };
    filter.status = { $in: ["pending", "confirmed"] };
  }

  const sessions = await LearningSession.find(filter)
    .sort({ scheduledAt: 1 })
    .populate("participants", "firstName lastName")
    .populate("createdBy", "firstName lastName")
    .lean();

  return sessions.map((s) => {
    const partner = s.participants.find((p) => String(p._id) !== String(userId));
    return {
      ...s,
      partner: partner
        ? {
            _id: partner._id,
            name: `${partner.firstName} ${partner.lastName}`.trim(),
          }
        : null,
      creatorName: s.createdBy
        ? `${s.createdBy.firstName} ${s.createdBy.lastName}`.trim()
        : "",
    };
  });
}

async function getSessionById(sessionId, userId) {
  const session = await LearningSession.findById(sessionId)
    .populate("participants", "firstName lastName")
    .lean();
  if (!session) throw new Error("Session not found");
  if (!session.participants.some((p) => String(p._id) === String(userId))) {
    throw new Error("Not allowed");
  }
  const partner = session.participants.find(
    (p) => String(p._id) !== String(userId)
  );
  return {
    ...session,
    partner: partner
      ? {
          _id: partner._id,
          name: `${partner.firstName} ${partner.lastName}`.trim(),
        }
      : null,
  };
}

module.exports = {
  scheduleSession,
  confirmSession,
  startSession,
  completeSession,
  getMySessions,
  getSessionById,
};
