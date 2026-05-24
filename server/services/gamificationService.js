const Feedback = require("../models/Feedback");
const { createNotification } = require("./notificationService");
const { getIO } = require("./socketService");

const POINT_VALUES = {
  VERIFICATION_PASS: 100,
  VERIFICATION_FAIL: 15,
  SESSION_COMPLETE: 75,
  FEEDBACK_GIVEN: 25,
};

const SESSION_BADGES = [
  {
    badgeId: "first-session",
    name: "First Exchange",
    description: "Completed your first live learning session",
    minSessions: 1,
  },
  {
    badgeId: "session-veteran",
    name: "Session Veteran",
    description: "Completed 5 learning sessions",
    minSessions: 5,
  },
  {
    badgeId: "exchange-champion",
    name: "Exchange Champion",
    description: "Completed 10 learning sessions",
    minSessions: 10,
  },
];

function awardPoints(user, amount) {
  user.points = Math.max(0, (user.points || 0) + amount);
}

function hasBadge(user, badgeId) {
  return (user.badges || []).some((b) => b.badgeId === badgeId);
}

function grantBadge(user, { badgeId, name, description }) {
  if (hasBadge(user, badgeId)) return false;

  if (!user.badges) user.badges = [];
  user.badges.push({
    badgeId,
    name,
    description,
    earnedAt: new Date(),
  });
  return true;
}

function syncVerificationBadges(user) {
  const verifiedCount = (user.skills || []).filter((s) => s.verified).length;
  let changed = false;

  if (
    verifiedCount >= 1 &&
    grantBadge(user, {
      badgeId: "first-verified",
      name: "Skill Verified",
      description: "Passed your first AI skill verification",
    })
  ) {
    changed = true;
  }

  if (
    verifiedCount >= 3 &&
    grantBadge(user, {
      badgeId: "skill-master",
      name: "Skill Master",
      description: "Verified 3 or more skills",
    })
  ) {
    changed = true;
  }

  if ((user.points || 0) >= 500) {
    if (
      grantBadge(user, {
        badgeId: "point-champion",
        name: "Point Champion",
        description: "Earned 500+ gamification points",
      })
    ) {
      changed = true;
    }
  }

  return changed;
}

function syncSessionBadges(user) {
  const total = user.totalSessions || 0;
  let changed = false;
  for (const def of SESSION_BADGES) {
    if (total >= def.minSessions) {
      if (
        grantBadge(user, {
          badgeId: def.badgeId,
          name: def.name,
          description: def.description,
        })
      ) {
        changed = true;
      }
    }
  }
  return changed;
}

async function notifyBadgeAndPoints(user, { badge, points }) {
  if (points > 0) {
    await createNotification({
      userId: user._id,
      type: "points_earned",
      title: "Points earned",
      message: `+${points} points added to your profile`,
      meta: { points },
    });
  }
  if (badge) {
    await createNotification({
      userId: user._id,
      type: "badge_earned",
      title: "Badge unlocked",
      message: `You earned the "${badge.name}" badge`,
      meta: { badgeId: badge.badgeId },
    });
    try {
      const io = getIO();
      io.to(`user:${user._id}`).emit("gamification:achievement", {
        badge,
        points,
      });
    } catch {
      // ignore
    }
  }
}

async function awardSessionCompletion(user, session) {
  if (!user) return;
  awardPoints(user, POINT_VALUES.SESSION_COMPLETE);
  user.totalSessions = (user.totalSessions || 0) + 1;
  const hours = (session.durationMinutes || 60) / 60;
  user.teachingHours = (user.teachingHours || 0) + hours / 2;
  user.learningHours = (user.learningHours || 0) + hours / 2;

  const beforeBadges = (user.badges || []).length;
  syncSessionBadges(user);
  syncVerificationBadges(user);
  const newBadge =
    (user.badges || []).length > beforeBadges
      ? user.badges[user.badges.length - 1]
      : null;

  await user.save();
  await notifyBadgeAndPoints(user, {
    badge: newBadge,
    points: POINT_VALUES.SESSION_COMPLETE,
  });
}

async function awardFeedbackPoints(user) {
  awardPoints(user, POINT_VALUES.FEEDBACK_GIVEN);
  syncVerificationBadges(user);
  await user.save();
  await notifyBadgeAndPoints(user, { points: POINT_VALUES.FEEDBACK_GIVEN });
}

async function recalculateUserRating(userId) {
  const feedbacks = await Feedback.find({ toUserId: userId });
  if (feedbacks.length === 0) return;
  const avg =
    feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
  await require("../models/User").findByIdAndUpdate(userId, {
    rating: Math.round(avg * 10) / 10,
  });
}

module.exports = {
  POINT_VALUES,
  awardPoints,
  grantBadge,
  syncVerificationBadges,
  syncSessionBadges,
  awardSessionCompletion,
  awardFeedbackPoints,
  recalculateUserRating,
};
