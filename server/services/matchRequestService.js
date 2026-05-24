const User = require("../models/User");
const MatchRequest = require("../models/MatchRequest");
const {
  findMatches,
  computeMutualExchange,
} = require("./matchingService");
const { createNotification } = require("./notificationService");
const {
  upsertPendingConnection,
  acceptConnection,
  rejectConnection,
} = require("./connectionService");
const sessionService = require("./sessionService");

async function sendMatchRequest(fromUserId, toUserId, message = "") {
  if (String(fromUserId) === String(toUserId)) {
    throw new Error("You cannot match with yourself");
  }

  const [fromUser, toUser] = await Promise.all([
    User.findById(fromUserId),
    User.findById(toUserId),
  ]);

  if (!fromUser || !toUser) throw new Error("User not found");

  const { pairs, compatibilityScore } = computeMutualExchange(fromUser, toUser);
  if (pairs.length === 0) {
    throw new Error("No mutual skill exchange compatibility with this user");
  }

  const existingPending = await MatchRequest.findOne({
    $or: [
      { fromUserId, toUserId, status: "pending" },
      { fromUserId: toUserId, toUserId: fromUserId, status: "pending" },
    ],
  });

  if (existingPending) {
    throw new Error("A pending match request already exists between you two");
  }

  const existingAccepted = await MatchRequest.findOne({
    $or: [
      { fromUserId, toUserId, status: "accepted" },
      { fromUserId: toUserId, toUserId: fromUserId, status: "accepted" },
    ],
  });

  if (existingAccepted) {
    throw new Error("You are already matched with this user");
  }

  const primary = pairs[0];

  const request = await MatchRequest.create({
    fromUserId,
    toUserId,
    compatibilityScore,
    message,
    exchangePair: {
      requesterTeaches: primary.youTeach,
      requesterLearns: primary.youLearn,
      receiverTeaches: primary.theyTeach,
      receiverLearns: primary.theyLearn,
    },
  });

  const fromName = `${fromUser.firstName} ${fromUser.lastName}`.trim();

  await createNotification({
    userId: toUserId,
    type: "match_request",
    title: "New Skill Exchange Request",
    message: `${fromName} wants to exchange ${primary.youTeach} ↔ ${primary.youLearn}`,
    meta: { matchRequestId: request._id, fromUserId },
  });

  await upsertPendingConnection({
    initiatedBy: fromUserId,
    otherUserId: toUserId,
    matchRequestId: request._id,
    compatibilityScore,
    exchangePair: request.exchangePair,
  });

  return request;
}

async function respondToRequest(requestId, userId, action) {
  const request = await MatchRequest.findById(requestId);
  if (!request) throw new Error("Match request not found");

  if (String(request.toUserId) !== String(userId)) {
    throw new Error("Only the recipient can respond to this request");
  }

  if (request.status !== "pending") {
    throw new Error(`Request is already ${request.status}`);
  }

  request.status = action === "accept" ? "accepted" : "rejected";
  request.respondedAt = new Date();
  await request.save();

  const [fromUser, toUser] = await Promise.all([
    User.findById(request.fromUserId),
    User.findById(request.toUserId),
  ]);

  const fromName = `${fromUser.firstName} ${fromUser.lastName}`.trim();
  const toName = `${toUser.firstName} ${toUser.lastName}`.trim();
  const pair = request.exchangePair;

  if (action === "accept") {
    const sessionTitle = `Exchange: ${pair.requesterTeaches} ↔ ${pair.requesterLearns}`;

    fromUser.skillsExchanged = (fromUser.skillsExchanged || 0) + 1;
    toUser.skillsExchanged = (toUser.skillsExchanged || 0) + 1;

    const summary = `${pair.requesterTeaches} ↔ ${pair.requesterLearns}`;
    const historyEntry = {
      matchRequestId: request._id,
      compatibilityScore: request.compatibilityScore,
      exchangeSummary: summary,
      status: "accepted",
      createdAt: new Date(),
    };

    if (!fromUser.matchHistory) fromUser.matchHistory = [];
    if (!toUser.matchHistory) toUser.matchHistory = [];

    fromUser.matchHistory.push({
      ...historyEntry,
      matchedUserId: request.toUserId,
    });
    toUser.matchHistory.push({
      ...historyEntry,
      matchedUserId: request.fromUserId,
    });

    await Promise.all([fromUser.save(), toUser.save()]);

    const { connection, conversation } = await acceptConnection({
      matchRequestId: request._id,
      fromUser,
      toUser,
    });

    const defaultSchedule = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await sessionService.scheduleSession({
      userId: request.fromUserId,
      partnerId: request.toUserId,
      title: sessionTitle,
      scheduledAt: defaultSchedule,
      teachSkill: pair.requesterTeaches,
      learnSkill: pair.requesterLearns,
      notes: `Intro session with ${toName}. Use chat to agree on a time.`,
    });

    await createNotification({
      userId: request.fromUserId,
      type: "match_accepted",
      title: "Match Accepted!",
      message: `${toName} accepted your skill exchange (${pair.requesterTeaches} ↔ ${pair.requesterLearns})`,
      meta: {
        matchRequestId: request._id,
        connectionId: connection._id,
        conversationId: conversation._id,
      },
    });

    await createNotification({
      userId: request.toUserId,
      type: "match_accepted",
      title: "Skill Exchange Match Active",
      message: `You are now matched with ${fromName} for mutual learning`,
      meta: {
        matchRequestId: request._id,
        connectionId: connection._id,
        conversationId: conversation._id,
      },
    });
  } else {
    await rejectConnection({
      fromUserId: request.fromUserId,
      toUserId: request.toUserId,
      matchRequestId: request._id,
    });
    await createNotification({
      userId: request.fromUserId,
      type: "match_rejected",
      title: "Match Request Declined",
      message: `${toName} declined your exchange request`,
      meta: { matchRequestId: request._id },
    });
  }

  return request;
}

async function getMyRequests(userId) {
  const requests = await MatchRequest.find({
    $or: [{ fromUserId: userId }, { toUserId: userId }],
  })
    .sort({ createdAt: -1 })
    .populate("fromUserId", "firstName lastName bio location rating")
    .populate("toUserId", "firstName lastName bio location rating")
    .lean();

  return requests.map((req) => {
    const isSender = String(req.fromUserId._id) === String(userId);
    const other = isSender ? req.toUserId : req.fromUserId;

    return {
      _id: req._id,
      status: req.status,
      compatibilityScore: req.compatibilityScore,
      exchangePair: req.exchangePair,
      message: req.message,
      createdAt: req.createdAt,
      respondedAt: req.respondedAt,
      direction: isSender ? "sent" : "received",
      otherUser: {
        _id: other._id,
        name: `${other.firstName} ${other.lastName}`.trim(),
        bio: other.bio,
        location: other.location,
        rating: other.rating,
      },
    };
  });
}

async function getMatchHistory(userId) {
  return MatchRequest.find({
    $or: [{ fromUserId: userId }, { toUserId: userId }],
    status: "accepted",
  })
    .sort({ respondedAt: -1, updatedAt: -1 })
    .populate("fromUserId", "firstName lastName")
    .populate("toUserId", "firstName lastName")
    .lean();
}

module.exports = {
  sendMatchRequest,
  respondToRequest,
  getMyRequests,
  getMatchHistory,
  findMatches,
};
