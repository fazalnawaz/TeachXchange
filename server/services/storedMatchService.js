const StoredMatch = require("../models/StoredMatch");
const User = require("../models/User");
const { normalizeSkillName } = require("../utils/syncUserSkills");

function buildSearchText(userSummary, pairs) {
  const parts = [
    userSummary.name,
    ...(userSummary.teachSkills || []).map((s) =>
      typeof s === "string" ? s : s.name
    ),
    ...(userSummary.learnSkills || []).map((s) =>
      typeof s === "string" ? s : s.name
    ),
    ...pairs.flatMap((p) => [p.youTeach, p.youLearn, p.theyTeach, p.theyLearn]),
  ];
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

async function persistMatches(ownerUserId, matchResults) {
  const activeIds = new Set();

  const ops = matchResults.map((match) => {
    const matchedUserId = match.user._id;
    activeIds.add(String(matchedUserId));

    const teachList = match.user.teachSkills || [];
    const verifiedTeachCount = teachList.filter((s) =>
      typeof s === "object" ? s.verified : false
    ).length;

    const displayName =
      match.user.name ||
      `${match.user.firstName || ""} ${match.user.lastName || ""}`.trim() ||
      "Exchange Partner";

    return {
      updateOne: {
        filter: { ownerUserId, matchedUserId },
        update: {
          $set: {
            compatibilityScore: match.compatibilityScore,
            exchangePairs: match.exchangePairs,
            primaryExchange: match.primaryExchange,
            matchedUserSnapshot: {
              name: displayName,
              firstName: match.user.firstName,
              lastName: match.user.lastName,
              bio: match.user.bio || "",
              location: match.user.location || "Worldwide",
              rating: match.user.rating || 0,
              role: match.user.role,
              isVerified: !!match.user.isVerified,
              teachSkills: teachList,
              learnSkills: match.user.learnSkills || [],
              verifiedTeachCount,
            },
            searchText: buildSearchText(
              { ...match.user, name: displayName },
              match.exchangePairs
            ),
            hasVerifiedExchange: verifiedTeachCount > 0 || !!match.user.isVerified,
          },
        },
        upsert: true,
      },
    };
  });

  if (ops.length > 0) {
    await StoredMatch.bulkWrite(ops);
  }

  await StoredMatch.deleteMany({
    ownerUserId,
    matchedUserId: { $nin: [...activeIds] },
  });
}

async function queryStoredMatches(ownerUserId, options = {}) {
  const { search = "", minScore = 0, limit = 24, verifiedOnly = false } = options;

  const filter = {
    ownerUserId,
    compatibilityScore: { $gte: minScore },
  };

  if (verifiedOnly) {
    filter.hasVerifiedExchange = true;
  }

  if (search && String(search).trim()) {
    const terms = String(search)
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    if (terms.length > 0) {
      filter.$and = terms.map((term) => ({
        searchText: {
          $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          $options: "i",
        },
      }));
    }
  }

  return StoredMatch.find(filter)
    .sort({ compatibilityScore: -1, updatedAt: -1 })
    .limit(limit)
    .lean();
}

function snapshotToUser(snap, matchedUserId) {
  const name =
    snap?.name ||
    `${snap?.firstName || ""} ${snap?.lastName || ""}`.trim() ||
    "Exchange Partner";

  return {
    _id: matchedUserId,
    name,
    firstName: snap?.firstName,
    lastName: snap?.lastName,
    bio: snap?.bio || "",
    location: snap?.location || "Worldwide",
    rating: snap?.rating || 0,
    role: snap?.role,
    isVerified: !!snap?.isVerified,
    teachSkills: snap?.teachSkills || [],
    learnSkills: snap?.learnSkills || [],
  };
}

function storedToApiMatch(doc, requestInfo, isBestMatch) {
  const snap = doc.matchedUserSnapshot || {};
  return {
    user: snapshotToUser(snap, doc.matchedUserId),
    compatibilityScore: doc.compatibilityScore,
    exchangePairs: doc.exchangePairs || [],
    primaryExchange: doc.primaryExchange,
    isBestMatch,
    requestStatus: requestInfo.status,
    requestId: requestInfo.requestId,
    headline: "Skill Exchange Match Found",
    storedAt: doc.updatedAt,
  };
}

/** Fill missing names from live User documents */
async function enrichMatchesWithUsers(matches) {
  if (!matches.length) return matches;

  const ids = matches.map((m) => m.user._id).filter(Boolean);
  const users = await User.find({ _id: { $in: ids } })
    .select(
      "firstName lastName email bio location rating role isVerified skills learningGoals"
    )
    .lean();

  const byId = new Map(users.map((u) => [String(u._id), u]));

  return matches.map((match) => {
    const live = byId.get(String(match.user._id));
    if (!live) {
      return {
        ...match,
        user: {
          ...match.user,
          name: match.user.name || "Exchange Partner",
        },
      };
    }

    const fullName =
      `${live.firstName || ""} ${live.lastName || ""}`.trim() ||
      live.email ||
      match.user.name ||
      "Exchange Partner";

    return {
      ...match,
      user: {
        _id: live._id,
        name: fullName,
        firstName: live.firstName,
        lastName: live.lastName,
        bio: live.bio || match.user.bio,
        location: live.location || match.user.location,
        rating: live.rating ?? match.user.rating,
        role: live.role,
        isVerified: live.isVerified ?? match.user.isVerified,
        teachSkills: (live.skills || []).map((s) => ({
          _id: s._id,
          name: s.name,
          category: s.category,
          verified: !!s.verified,
          proficiency: s.proficiency,
        })),
        learnSkills: (live.learningGoals || []).map((g) => ({
          _id: g._id,
          name: g.name,
          category: g.category,
          interest: g.interest,
        })),
      },
    };
  });
}

module.exports = {
  persistMatches,
  queryStoredMatches,
  storedToApiMatch,
  enrichMatchesWithUsers,
  buildSearchText,
};
