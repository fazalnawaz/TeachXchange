const User = require("../models/User");
const LearningSession = require("../models/LearningSession");
const VerificationResult = require("../models/VerificationResult");
const VerificationAttempt = require("../models/VerificationAttempt");
const Feedback = require("../models/Feedback");

/**
 * GET /api/admin/stats
 * High-level metrics for the admin dashboard cards.
 */
exports.getStats = async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    bannedUsers,
    teachers,
    learners,
    admins,
    sessionsToday,
    activeSessions,
    completedSessions,
    pendingVerifications,
    totalVerifications,
    passedVerifications,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ accountStatus: "active" }),
    User.countDocuments({ accountStatus: "suspended" }),
    User.countDocuments({ accountStatus: "banned" }),
    User.countDocuments({ role: "teacher" }),
    User.countDocuments({ role: "learner" }),
    User.countDocuments({ role: "admin" }),
    LearningSession.countDocuments({ scheduledAt: { $gte: startOfDay } }),
    LearningSession.countDocuments({ status: { $in: ["pending", "confirmed"] } }),
    LearningSession.countDocuments({ status: "completed" }),
    // "Pending" = users who still have at least one unverified skill
    User.countDocuments({ "skills.verified": false }),
    VerificationResult.countDocuments(),
    VerificationResult.countDocuments({ status: "PASSED" }),
  ]);

  // Last 7 days signup trend (skips docs created before timestamps existed)
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);
  const signups = await User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    users: {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
      banned: bannedUsers,
      teachers,
      learners,
      admins,
    },
    sessions: {
      today: sessionsToday,
      active: activeSessions,
      completed: completedSessions,
    },
    verifications: {
      pending: pendingVerifications,
      total: totalVerifications,
      passed: passedVerifications,
      passRate:
        totalVerifications > 0
          ? Math.round((passedVerifications / totalVerifications) * 100)
          : 0,
    },
    signupTrend: signups,
  });
};

/**
 * GET /api/admin/users
 * Paginated, searchable, filterable user list for the table.
 * Query: ?search=&role=&status=&page=&limit=
 */
exports.listUsers = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const { search = "", role = "", status = "" } = req.query;

  const filter = {};
  if (search.trim()) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }];
  }
  if (role) filter.role = role;
  if (status) filter.accountStatus = status;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(
        "firstName lastName email role accountStatus isVerified points rating createdAt skills"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  const rows = users.map((u) => ({
    _id: u._id,
    name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unnamed",
    email: u.email,
    role: u.role,
    accountStatus: u.accountStatus || "active",
    isVerified: Boolean(u.isVerified),
    verifiedSkills: (u.skills || []).filter((s) => s.verified).length,
    totalSkills: (u.skills || []).length,
    points: u.points || 0,
    rating: u.rating || 0,
    createdAt: u.createdAt || null,
  }));

  res.json({
    users: rows,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
};

/**
 * GET /api/admin/users/:id — full profile for the admin detail view.
 */
exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password").lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  const [sessionCount, verifications] = await Promise.all([
    LearningSession.countDocuments({ participants: user._id }),
    VerificationResult.find({ userId: user._id })
      .select("skillName score status createdAt")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  res.json({ user, sessionCount, verifications });
};

/**
 * PATCH /api/admin/users/:id/status  body: { accountStatus }
 */
exports.updateUserStatus = async (req, res) => {
  const { accountStatus } = req.body;
  if (!["active", "suspended", "banned"].includes(accountStatus)) {
    return res.status(400).json({ message: "Invalid account status" });
  }
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot change your own status" });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { accountStatus },
    { new: true }
  ).select("firstName lastName email role accountStatus");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ message: `Account ${accountStatus}`, user });
};

/**
 * PATCH /api/admin/users/:id/role  body: { role }
 */
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!["learner", "teacher", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select("firstName lastName email role accountStatus");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ message: `Role updated to ${role}`, user });
};

/**
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
};

/**
 * GET /api/admin/verifications — recent verification results.
 * Query: ?status=PASSED|FAILED&page=&limit=
 */
exports.listVerifications = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const { status = "" } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const [results, total] = await Promise.all([
    VerificationResult.find(filter)
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    VerificationResult.countDocuments(filter),
  ]);

  const rows = results.map((r) => ({
    _id: r._id,
    user: r.userId
      ? `${r.userId.firstName || ""} ${r.userId.lastName || ""}`.trim()
      : "Deleted user",
    email: r.userId?.email || "",
    skillName: r.skillName,
    category: r.categoryLabel || r.skillCategory,
    score: r.score,
    status: r.status,
    correctAnswers: r.correctAnswers,
    totalQuestions: r.totalQuestions,
    createdAt: r.createdAt,
  }));

  res.json({ verifications: rows, page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
};

/**
 * GET /api/admin/sessions — recent learning sessions.
 * Query: ?status=&page=&limit=
 */
exports.listSessions = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const { status = "" } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const [sessions, total] = await Promise.all([
    LearningSession.find(filter)
      .populate("participants", "firstName lastName email")
      .sort({ scheduledAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    LearningSession.countDocuments(filter),
  ]);

  const rows = sessions.map((s) => ({
    _id: s._id,
    title: s.title,
    participants: (s.participants || []).map((p) =>
      `${p.firstName || ""} ${p.lastName || ""}`.trim()
    ),
    teachSkill: s.teachSkill,
    learnSkill: s.learnSkill,
    status: s.status,
    scheduledAt: s.scheduledAt,
    durationMinutes: s.durationMinutes,
  }));

  res.json({ sessions: rows, page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
};
