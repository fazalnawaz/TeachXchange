const POINT_VALUES = {
  VERIFICATION_PASS: 100,
  VERIFICATION_FAIL: 15,
};

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

module.exports = {
  POINT_VALUES,
  awardPoints,
  grantBadge,
  syncVerificationBadges,
};
