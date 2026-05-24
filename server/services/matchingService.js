const mongoose = require("mongoose");
const User = require("../models/User");
const MatchRequest = require("../models/MatchRequest");
const StoredMatch = require("../models/StoredMatch");
const { syncUserSkillArrays, normalizeSkillName } = require("../utils/syncUserSkills");
const {
  persistMatches,
  queryStoredMatches,
  storedToApiMatch,
  enrichMatchesWithUsers,
} = require("./storedMatchService");

const SKILL_ALIASES = {
  javascript: ["js", "ecmascript", "node", "nodejs", "node.js", "java script"],
  python: ["py", "python3"],
  "graphic design": ["graphics", "graphic", "design", "photoshop", "illustrator"],
  react: ["reactjs", "react.js", "react js"],
  "node.js": ["nodejs", "node", "node js"],
};

function normalizeSkill(name = "") {
  return normalizeSkillName(name);
}

function skillsMatch(skillA, skillB) {
  const a = normalizeSkill(skillA);
  const b = normalizeSkill(skillB);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 3 && b.length >= 3 && (a.includes(b) || b.includes(a))) return true;

  const tokensA = a.split(" ").filter((t) => t.length >= 2);
  const tokensB = b.split(" ").filter((t) => t.length >= 2);
  if (tokensA.length && tokensB.length) {
    const shared = tokensA.filter((t) =>
      tokensB.some((u) => u === t || u.includes(t) || t.includes(u))
    );
    if (shared.length > 0) return true;
  }

  for (const [key, values] of Object.entries(SKILL_ALIASES)) {
    const group = [key, ...values];
    const aHit = group.some((g) => a === g || a.includes(g) || g.includes(a));
    const bHit = group.some((g) => b === g || b.includes(g) || g.includes(b));
    if (aHit && bHit) return true;
  }
  return false;
}

function getTeachList(user) {
  const fromArray = user.teachSkills || [];
  const fromDocs = (user.skills || []).map((s) => normalizeSkill(s.name));
  return [...new Set([...fromArray, ...fromDocs].filter(Boolean))];
}

function getLearnList(user) {
  const fromArray = user.learnSkills || [];
  const fromDocs = (user.learningGoals || []).map((g) => normalizeSkill(g.name));
  return [...new Set([...fromArray, ...fromDocs].filter(Boolean))];
}

/**
 * Bidirectional: my teach ↔ their learn AND my learn ↔ their teach.
 */
function hasBidirectionalExchange(userA, userB) {
  const aTeach = getTeachList(userA);
  const aLearn = getLearnList(userA);
  const bTeach = getTeachList(userB);
  const bLearn = getLearnList(userB);

  if (!aTeach.length || !aLearn.length || !bTeach.length || !bLearn.length) {
    return false;
  }

  const iTeachTheyLearn = aTeach.some((t) =>
    bLearn.some((l) => skillsMatch(t, l))
  );
  const iLearnTheyTeach = aLearn.some((l) =>
    bTeach.some((t) => skillsMatch(l, t))
  );

  return iTeachTheyLearn && iLearnTheyTeach;
}

function computeMutualExchange(currentUser, candidate) {
  const myTeach = currentUser.skills || [];
  const myLearn = currentUser.learningGoals || [];
  const theirTeach = candidate.skills || [];
  const theirLearn = candidate.learningGoals || [];

  const pairs = [];
  const seen = new Set();

  for (const teachMine of myTeach) {
    for (const learnMine of myLearn) {
      if (skillsMatch(teachMine.name, learnMine.name)) continue;

      for (const teachTheirs of theirTeach) {
        for (const learnTheirs of theirLearn) {
          if (skillsMatch(teachTheirs.name, learnTheirs.name)) continue;

          const iTeachTheyLearn = skillsMatch(teachMine.name, learnTheirs.name);
          const iLearnTheyTeach = skillsMatch(learnMine.name, teachTheirs.name);

          if (!iTeachTheyLearn || !iLearnTheyTeach) continue;

          const key = [
            normalizeSkill(teachMine.name),
            normalizeSkill(learnMine.name),
            normalizeSkill(teachTheirs.name),
            normalizeSkill(learnTheirs.name),
          ].join("::");

          if (seen.has(key)) continue;
          seen.add(key);

          let pairScore = 58;
          if (teachMine.verified) pairScore += 12;
          if (teachTheirs.verified) pairScore += 12;
          if (currentUser.isVerified) pairScore += 5;
          if (candidate.isVerified) pairScore += 5;
          pairScore += Math.min(8, (learnMine.interest || 3) * 2);
          pairScore += Math.min(8, (learnTheirs.interest || 3) * 2);

          pairs.push({
            youTeach: teachMine.name,
            youLearn: learnMine.name,
            theyTeach: teachTheirs.name,
            theyLearn: learnTheirs.name,
            pairScore,
          });
        }
      }
    }
  }

  const compatibilityScore =
    pairs.length === 0
      ? 0
      : Math.min(
          100,
          Math.round(pairs.reduce((s, p) => s + p.pairScore, 0) / pairs.length)
        );

  return {
    pairs: pairs.map(({ pairScore, ...r }) => r),
    compatibilityScore,
  };
}

function formatUserSummary(user) {
  const name =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.email ||
    "Exchange Partner";

  return {
    _id: user._id,
    name,
    firstName: user.firstName,
    bio: user.bio || "",
    location: user.location || "Worldwide",
    rating: user.rating || 0,
    role: user.role,
    isVerified: user.isVerified || false,
    teachSkills: (user.skills || []).map((s) => ({
      _id: s._id,
      name: s.name,
      category: s.category,
      verified: !!s.verified,
      proficiency: s.proficiency,
    })),
    learnSkills: (user.learningGoals || []).map((g) => ({
      _id: g._id,
      name: g.name,
      category: g.category,
      interest: g.interest,
    })),
  };
}

/** Load all other users who have both teach + learn data (nested or string arrays). */
function buildCandidateQuery(userId) {
  return {
    _id: { $ne: new mongoose.Types.ObjectId(String(userId)) },
    "skills.0": { $exists: true },
    "learningGoals.0": { $exists: true },
  };
}

function resolveRequestStatus(requests, currentUserId, candidateId) {
  const cur = String(currentUserId);
  const cand = String(candidateId);

  for (const req of requests) {
    const from = String(req.fromUserId);
    const to = String(req.toUserId);
    if ((from === cur && to === cand) || (from === cand && to === cur)) {
      if (req.status === "accepted") {
        return { status: "accepted", requestId: req._id };
      }
      if (req.status === "pending") {
        return {
          status: from === cur ? "pending_sent" : "pending_received",
          requestId: req._id,
        };
      }
    }
  }
  return { status: null, requestId: null };
}

/** Sync teachSkills/learnSkills string arrays for all users with profile skills */
async function syncAllUsersSkillArrays() {
  const users = await User.find({
    $or: [{ "skills.0": { $exists: true } }, { "learningGoals.0": { $exists: true } }],
  }).limit(300);

  await Promise.all(
    users.map(async (u) => {
      syncUserSkillArrays(u);
      await u.save();
    })
  );
}

async function computeLiveMatches(currentUser, userId) {
  await syncAllUsersSkillArrays();

  const candidates = await User.find(buildCandidateQuery(userId))
    .select(
      "firstName lastName email bio location rating role isVerified skills learningGoals teachSkills learnSkills verifiedSkills"
    )
    .lean()
    .limit(300);

  const results = [];
  const seen = new Set();

  for (const candidate of candidates) {
    const cid = String(candidate._id);
    if (seen.has(cid)) continue;
    if (!hasBidirectionalExchange(currentUser, candidate)) continue;

    const { pairs, compatibilityScore } = computeMutualExchange(
      currentUser,
      candidate
    );
    if (pairs.length === 0) continue;

    seen.add(cid);
    results.push({
      user: formatUserSummary(candidate),
      compatibilityScore,
      exchangePairs: pairs,
      primaryExchange: pairs[0],
    });
  }

  results.sort((a, b) => {
    const verifiedBoost = (m) =>
      (m.user.teachSkills || []).some((s) => s && s.verified) +
      (m.user.isVerified ? 1 : 0);
    const diff = b.compatibilityScore - a.compatibilityScore;
    if (diff !== 0) return diff;
    return verifiedBoost(b) - verifiedBoost(a);
  });

  return results;
}

async function findMatches(userId, options = {}) {
  const {
    search = "",
    minScore = 0,
    limit = 24,
    refresh = false,
    verifiedOnly = false,
  } = options;

  let currentUser = await User.findById(userId).select(
    "firstName lastName bio location rating role isVerified skills learningGoals teachSkills learnSkills verifiedSkills"
  );

  if (!currentUser) throw new Error("User not found");

  syncUserSkillArrays(currentUser);
  await currentUser.save();

  const myTeach = getTeachList(currentUser);
  const myLearn = getLearnList(currentUser);

  const currentUserSummary = {
    teachSkills: myTeach.map((name) => ({ name })),
    learnSkills: myLearn.map((name) => ({ name })),
    verifiedSkills: currentUser.verifiedSkills || [],
  };

  if (myTeach.length === 0 || myLearn.length === 0) {
    return {
      matches: [],
      total: 0,
      hint: "Add at least one skill you can teach AND one skill you want to learn.",
      userReady: false,
      currentUser: currentUserSummary,
    };
  }

  const shouldRefresh =
    refresh ||
    (await StoredMatch.countDocuments({ ownerUserId: userId })) === 0;

  if (shouldRefresh) {
    const live = await computeLiveMatches(currentUser, userId);
    await persistMatches(userId, live);
  } else {
    const stale = await StoredMatch.findOne({
      ownerUserId: userId,
      "matchedUserSnapshot.name": { $in: [null, "", "Exchange Partner"] },
    });
    if (stale) {
      const live = await computeLiveMatches(currentUser, userId);
      await persistMatches(userId, live);
    }
  }

  const stored = await queryStoredMatches(userId, {
    search,
    minScore,
    limit: limit + 10,
    verifiedOnly,
  });

  const existingRequests = await MatchRequest.find({
    $or: [{ fromUserId: userId }, { toUserId: userId }],
    status: { $in: ["pending", "accepted"] },
  }).lean();

  let matches = stored.map((doc, index) => {
    const requestInfo = resolveRequestStatus(
      existingRequests,
      userId,
      doc.matchedUserId
    );
    return storedToApiMatch(doc, requestInfo, index === 0);
  });

  matches = await enrichMatchesWithUsers(matches);

  if (matches.length > 0) {
    matches[0].isBestMatch = true;
    for (let i = 1; i < matches.length; i++) matches[i].isBestMatch = false;
  }

  return {
    matches: matches.slice(0, limit),
    total: await StoredMatch.countDocuments({
      ownerUserId: userId,
      compatibilityScore: { $gte: minScore },
    }),
    userReady: true,
    hint: null,
    currentUser: currentUserSummary,
    fromCache: !shouldRefresh,
  };
}

async function getMatchStats(userId) {
  const [pendingReceived, pendingSent, accepted, recommendations] =
    await Promise.all([
      MatchRequest.countDocuments({ toUserId: userId, status: "pending" }),
      MatchRequest.countDocuments({ fromUserId: userId, status: "pending" }),
      MatchRequest.countDocuments({
        $or: [{ fromUserId: userId }, { toUserId: userId }],
        status: "accepted",
      }),
      findMatches(userId, { limit: 3, refresh: true }),
    ]);

  return {
    pendingReceived,
    pendingSent,
    acceptedMatches: accepted,
    topMatches: recommendations.matches,
    currentUser: recommendations.currentUser,
    userReady: recommendations.userReady,
  };
}

module.exports = {
  findMatches,
  getMatchStats,
  computeMutualExchange,
  hasBidirectionalExchange,
  skillsMatch,
  formatUserSummary,
  computeLiveMatches,
};
