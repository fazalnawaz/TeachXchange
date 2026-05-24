/**
 * Keeps teachSkills / learnSkills / verifiedSkills string arrays in sync
 * with nested skills and learningGoals documents.
 */

function normalizeSkillName(name = "") {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s+#]/gi, "")
    .replace(/\s+/g, " ");
}

function syncUserSkillArrays(user) {
  const skills = user.skills || [];
  const goals = user.learningGoals || [];

  user.teachSkills = [
    ...new Set(
      skills.map((s) => normalizeSkillName(s.name)).filter((n) => n.length > 0)
    ),
  ];

  user.learnSkills = [
    ...new Set(
      goals.map((g) => normalizeSkillName(g.name)).filter((n) => n.length > 0)
    ),
  ];

  user.verifiedSkills = [
    ...new Set(
      skills
        .filter((s) => s.verified)
        .map((s) => normalizeSkillName(s.name))
        .filter((n) => n.length > 0)
    ),
  ];

  return user;
}

module.exports = { syncUserSkillArrays, normalizeSkillName };
