const Connection = require("../models/Connection");
const Conversation = require("../models/Conversation");
const MatchRequest = require("../models/MatchRequest");
const { buildParticipantKey, sortedParticipants } = require("../utils/participantKey");
const { createNotification } = require("./notificationService");
const { getIO } = require("./socketService");

function formatUserName(user) {
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Partner";
}

async function upsertPendingConnection({
  initiatedBy,
  otherUserId,
  matchRequestId,
  compatibilityScore,
  exchangePair,
}) {
  const participantKey = buildParticipantKey(initiatedBy, otherUserId);
  const participants = sortedParticipants(initiatedBy, otherUserId);

  let connection = await Connection.findOne({
    participantKey,
    status: { $in: ["pending", "accepted"] },
  });

  if (connection?.status === "accepted") {
    return connection;
  }

  if (connection?.status === "pending") {
    connection.matchRequestId = matchRequestId;
    connection.compatibilityScore = compatibilityScore;
    connection.exchangePair = exchangePair;
    await connection.save();
    return connection;
  }

  connection = await Connection.create({
    participants,
    participantKey,
    initiatedBy,
    status: "pending",
    matchRequestId,
    compatibilityScore,
    exchangePair,
  });

  return connection;
}

async function acceptConnection({ matchRequestId, fromUser, toUser }) {
  const participantKey = buildParticipantKey(fromUser._id, toUser._id);
  let connection = await Connection.findOne({ participantKey });

  if (!connection) {
    connection = await Connection.create({
      participants: sortedParticipants(fromUser._id, toUser._id),
      participantKey,
      initiatedBy: fromUser._id,
      status: "accepted",
      matchRequestId,
      connectedAt: new Date(),
    });
  } else {
    connection.status = "accepted";
    connection.connectedAt = new Date();
    connection.matchRequestId = matchRequestId;
    await connection.save();
  }

  let conversation = await Conversation.findOne({ participantKey });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: connection.participants,
      participantKey,
      connectionId: connection._id,
      unreadCounts: new Map(),
    });
  }

  const fromName = formatUserName(fromUser);
  const toName = formatUserName(toUser);

  const connectedMessage =
    "You are now connected with your learning partner";

  await Promise.all([
    createNotification({
      userId: fromUser._id,
      type: "connection_accepted",
      title: "Connected!",
      message: `${connectedMessage}: ${toName}`,
      meta: {
        connectionId: connection._id,
        conversationId: conversation._id,
        partnerId: toUser._id,
      },
    }),
    createNotification({
      userId: toUser._id,
      type: "connection_accepted",
      title: "Connected!",
      message: `${connectedMessage}: ${fromName}`,
      meta: {
        connectionId: connection._id,
        conversationId: conversation._id,
        partnerId: fromUser._id,
      },
    }),
  ]);

  try {
    const io = getIO();
    io.to(`user:${fromUser._id}`).emit("connection:accepted", {
      connection,
      conversationId: conversation._id,
      partner: { _id: toUser._id, name: toName },
    });
    io.to(`user:${toUser._id}`).emit("connection:accepted", {
      connection,
      conversationId: conversation._id,
      partner: { _id: fromUser._id, name: fromName },
    });
    io.to(`user:${fromUser._id}`).emit("notification:new", { type: "connection_accepted" });
    io.to(`user:${toUser._id}`).emit("notification:new", { type: "connection_accepted" });
  } catch {
    // Socket may not be initialized in tests
  }

  return { connection, conversation };
}

async function rejectConnection({ fromUserId, toUserId, matchRequestId }) {
  const participantKey = buildParticipantKey(fromUserId, toUserId);
  const connection = await Connection.findOne({ participantKey, status: "pending" });
  if (connection) {
    connection.status = "rejected";
    await connection.save();
  }

  await createNotification({
    userId: fromUserId,
    type: "connection_rejected",
    title: "Connection Declined",
    message: "Your connection request was declined",
    meta: { matchRequestId },
  });
}

/** Find accepted connection by stable participant key (avoids ObjectId/string $all mismatches). */
async function findAcceptedConnection(userId, partnerId) {
  const participantKey = buildParticipantKey(userId, partnerId);
  return Connection.findOne({ participantKey, status: "accepted" });
}

/**
 * Ensure an accepted Connection exists for chat/sessions.
 * Backfills from accepted MatchRequest when connection records are missing (legacy data).
 */
async function ensureAcceptedConnection(userId, partnerId) {
  const participantKey = buildParticipantKey(userId, partnerId);
  let connection = await Connection.findOne({ participantKey, status: "accepted" });
  if (connection) return connection;

  const acceptedMatch = await MatchRequest.findOne({
    status: "accepted",
    $or: [
      { fromUserId: userId, toUserId: partnerId },
      { fromUserId: partnerId, toUserId: userId },
    ],
  });

  if (!acceptedMatch) return null;

  const pending = await Connection.findOne({ participantKey, status: "pending" });
  if (pending) {
    pending.status = "accepted";
    pending.connectedAt = pending.connectedAt || new Date();
    pending.matchRequestId = pending.matchRequestId || acceptedMatch._id;
    pending.compatibilityScore =
      pending.compatibilityScore ?? acceptedMatch.compatibilityScore;
    pending.exchangePair = pending.exchangePair || acceptedMatch.exchangePair;
    await pending.save();
    return pending;
  }

  connection = await Connection.findOneAndUpdate(
    { participantKey },
    {
      $set: {
        status: "accepted",
        connectedAt: new Date(),
        matchRequestId: acceptedMatch._id,
        compatibilityScore: acceptedMatch.compatibilityScore,
        exchangePair: acceptedMatch.exchangePair,
      },
      $setOnInsert: {
        participants: sortedParticipants(userId, partnerId),
        participantKey,
        initiatedBy: acceptedMatch.fromUserId,
      },
    },
    { upsert: true, new: true }
  );

  return connection;
}

async function ensureConversationForConnection(connection) {
  const participantKey = connection.participantKey;
  let conversation = await Conversation.findOne({ participantKey });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: connection.participants,
      participantKey,
      connectionId: connection._id,
      unreadCounts: new Map(),
    });
  }
  return conversation;
}

/** Backfill connections/conversations for all accepted matches (e.g. after upgrade). */
async function syncConnectionsFromAcceptedMatches(userId) {
  const matches = await MatchRequest.find({
    status: "accepted",
    $or: [{ fromUserId: userId }, { toUserId: userId }],
  }).lean();

  for (const match of matches) {
    const partnerId =
      String(match.fromUserId) === String(userId)
        ? match.toUserId
        : match.fromUserId;
    const connection = await ensureAcceptedConnection(userId, partnerId);
    if (connection) {
      await ensureConversationForConnection(connection);
    }
  }
}

async function getMyConnections(userId, status = "accepted") {
  if (!status || status === "accepted") {
    await syncConnectionsFromAcceptedMatches(userId);
  }

  const filter = {
    participants: userId,
    ...(status ? { status } : {}),
  };

  const connections = await Connection.find(filter)
    .sort({ updatedAt: -1 })
    .populate("participants", "firstName lastName bio location rating teachSkills learnSkills skills learningGoals")
    .lean();

  return connections.map((conn) => {
    const partner = conn.participants.find(
      (p) => String(p._id) !== String(userId)
    );
    return {
      _id: conn._id,
      status: conn.status,
      compatibilityScore: conn.compatibilityScore,
      exchangePair: conn.exchangePair,
      connectedAt: conn.connectedAt,
      createdAt: conn.createdAt,
      matchRequestId: conn.matchRequestId,
      partner: partner
        ? {
            _id: partner._id,
            name: `${partner.firstName} ${partner.lastName}`.trim(),
            bio: partner.bio,
            location: partner.location,
            rating: partner.rating,
            teachSkills: partner.teachSkills,
            learnSkills: partner.learnSkills,
          }
        : null,
    };
  });
}

module.exports = {
  upsertPendingConnection,
  acceptConnection,
  rejectConnection,
  findAcceptedConnection,
  ensureAcceptedConnection,
  ensureConversationForConnection,
  syncConnectionsFromAcceptedMatches,
  getMyConnections,
};
