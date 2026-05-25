const User = require("../models/User");
const VerificationAttempt = require("../models/VerificationAttempt");
const VerificationResult = require("../models/VerificationResult");
const {
  generateQuiz,
  gradeQuiz,
  getVerificationHistory,
  PASS_THRESHOLD,
} = require("./quizGeneratorService");
const { detectSkillContext } = require("./skillCategoryService");
const SkillQuestionHistory = require("../models/SkillQuestionHistory");
const { syncUserSkillArrays } = require("../utils/syncUserSkills");
const { createNotification } = require("./notificationService");
const {
  POINT_VALUES,
  awardPoints,
  syncVerificationBadges,
} = require("./gamificationService");

function sanitizeQuestionsForClient(questions) {
  return questions.map((q) => ({
    questionId: q.questionId,
    question: q.question,
    options: q.options,
    questionType: q.questionType,
    difficulty: q.difficulty,
    hasCode: q.hasCode,
    conceptTag: q.conceptTag,
  }));
}

async function getVerificationStats(userId) {
  const user = await User.findById(userId).select("skills points badges");
  if (!user) throw new Error("User not found");

  const skills = user.skills || [];
  const results = await VerificationResult.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    totalSkills: skills.length,
    verifiedCount: skills.filter((s) => s.verified).length,
    pendingCount: skills.filter((s) => !s.verified).length,
    trustScore:
      skills.length > 0
        ? Math.round(
            (skills.filter((s) => s.verified).length / skills.length) * 100
          )
        : 0,
    points: user.points || 0,
    badges: user.badges || [],
    recentResults: results,
    passThreshold: PASS_THRESHOLD,
  };
}

async function startQuiz(userId, skillId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const skill = user.skills.id(skillId);
  if (!skill) throw new Error("Skill not found");
  if (skill.verified) throw new Error("This skill is already verified");

  await VerificationAttempt.deleteMany({
    userId,
    skillId,
    submitted: false,
  });

  const priorHistory = await getVerificationHistory(userId, skill.name);

  const skillPayload = {
    name: skill.name,
    category: skill.category,
    proficiency: skill.proficiency,
    experience: skill.experience,
    description: skill.description,
  };

  const context = detectSkillContext(skillPayload);

  const {
    questions,
    modelUsed,
    source,
    skillCategory,
    categoryLabel,
    skillKey,
    sessionSeed,
    askedConcepts,
  } = await generateQuiz(skillPayload, { priorHistory });

  const attempt = await VerificationAttempt.create({
    userId,
    skillId,
    skillName: skill.name,
    skillKey: skillKey || "general",
    skillCategory: skillCategory || context.categoryId,
    categoryLabel: categoryLabel || context.categoryLabel,
    profileCategory: skill.category,
    proficiency: skill.proficiency,
    sessionSeed,
    askedConcepts,
    questions,
    modelUsed,
    source,
  });

  await SkillQuestionHistory.create({
    userId,
    skillId,
    skillName: skill.name,
    skillKey: skillKey || "general",
    questionHashes: questions.map((q) => q.questionHash).filter(Boolean),
    conceptTags: askedConcepts || [],
    sessionSeed,
    attemptId: attempt._id,
  });

  return {
    attemptId: attempt._id,
    skillName: skill.name,
    skillKey: attempt.skillKey,
    skillCategory: attempt.skillCategory,
    categoryLabel: attempt.categoryLabel,
    questionCount: questions.length,
    timeLimitSeconds: 900,
    passThreshold: PASS_THRESHOLD,
    questions: sanitizeQuestionsForClient(questions),
    modelUsed,
    source,
  };
}

async function submitQuiz(userId, attemptId, answers, timeTakenSeconds = 0) {
  const attempt = await VerificationAttempt.findOne({
    _id: attemptId,
    userId,
    submitted: false,
  });

  if (!attempt) {
    throw new Error("Quiz attempt not found or already submitted");
  }

  if (new Date() > attempt.expiresAt) {
    throw new Error("Quiz attempt has expired. Please start a new quiz.");
  }

  const grade = gradeQuiz(
    attempt.questions,
    answers,
    attempt.skillCategory || "general"
  );

  attempt.submitted = true;
  await attempt.save();

  const user = await User.findById(userId);
  const skill = user.skills.id(attempt.skillId);
  if (!skill) throw new Error("Skill not found");

  skill.verifiedScore = grade.score;
  skill.verified = grade.verified;
  skill.verificationMethod = "ai_quiz";
  if (grade.verified) {
    skill.verifiedAt = new Date();
    skill.verificationCategory = attempt.skillCategory;
    user.isVerified = true;
  }

  const pointsEarned = grade.verified
    ? POINT_VALUES.VERIFICATION_PASS
    : POINT_VALUES.VERIFICATION_FAIL;
  awardPoints(user, pointsEarned);
  syncVerificationBadges(user);
  syncUserSkillArrays(user);

  await VerificationResult.create({
    userId,
    skillId: attempt.skillId,
    skillName: attempt.skillName,
    skillCategory: attempt.skillCategory,
    categoryLabel: attempt.categoryLabel,
    score: grade.score,
    weightedScore: grade.score,
    totalQuestions: grade.totalQuestions,
    correctAnswers: grade.correctAnswers,
    verified: grade.verified,
    status: grade.status,
    answers: grade.gradedAnswers,
    modelUsed: attempt.modelUsed,
    source: attempt.source,
    timeTakenSeconds,
    passThreshold: PASS_THRESHOLD,
  });

  await createNotification({
    userId,
    type: grade.verified ? "verification_pass" : "verification_fail",
    title: grade.verified ? "Skill Verified!" : "Verification Failed",
    message: grade.verified
      ? `You passed the ${attempt.skillName} (${attempt.categoryLabel}) assessment with ${grade.score}% and earned ${pointsEarned} points!`
      : `You scored ${grade.score}% on ${attempt.skillName}. Minimum ${PASS_THRESHOLD}% required. Try again!`,
    meta: { skillId: attempt.skillId, score: grade.score },
  });

  if (grade.verified) {
    await createNotification({
      userId,
      type: "badge_earned",
      title: "Achievement Unlocked",
      message: `Verified badge earned for ${attempt.skillName}`,
      meta: { skillName: attempt.skillName },
    });
  }

  await user.save();

  return {
    score: grade.score,
    verified: grade.verified,
    status: grade.status,
    correctAnswers: grade.correctAnswers,
    totalQuestions: grade.totalQuestions,
    pointsEarned,
    totalPoints: user.points,
    badges: user.badges,
    skillName: attempt.skillName,
    skillKey: attempt.skillKey,
    skillCategory: attempt.skillCategory,
    categoryLabel: attempt.categoryLabel,
    passThreshold: PASS_THRESHOLD,
    message: grade.verified
      ? "Congratulations! Your skill has been verified."
      : `Score below ${PASS_THRESHOLD}%. Please review and try again.`,
  };
}

async function previewSkillCategory(userId, skillId) {
  const user = await User.findById(userId).select("skills");
  if (!user) throw new Error("User not found");

  const skill = user.skills.id(skillId);
  if (!skill) throw new Error("Skill not found");

  const context = detectSkillContext({
    name: skill.name,
    category: skill.category,
    proficiency: skill.proficiency,
    experience: skill.experience,
    description: skill.description,
  });

  const { normalizeSkillKey } = require("./aiQuizPromptService");

  return {
    skillCategory: context.categoryId,
    categoryLabel: context.categoryLabel,
    skillKey: normalizeSkillKey(skill.name),
    displayName: skill.name,
    questionTypes: context.questionTypes,
    aiOnly: true,
  };
}

module.exports = {
  getVerificationStats,
  startQuiz,
  submitQuiz,
  previewSkillCategory,
};
