const User = require("../models/User");
const VerificationAttempt = require("../models/VerificationAttempt");
const VerificationResult = require("../models/VerificationResult");
const { generateQuiz, gradeQuiz } = require("./quizGeneratorService");
const {
  createNotification,
} = require("./notificationService");
const {
  POINT_VALUES,
  awardPoints,
  syncVerificationBadges,
} = require("./gamificationService");

/**
 * Strip correct answers before sending quiz to client.
 */
function sanitizeQuestionsForClient(questions) {
  return questions.map((q) => ({
    questionId: q.questionId,
    question: q.question,
    options: q.options,
  }));
}

async function getVerificationStats(userId) {
  const user = await User.findById(userId).select("skills points badges");
  if (!user) throw new Error("User not found");

  const skills = user.skills || [];
  const results = await VerificationResult.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10);

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
  };
}

async function startQuiz(userId, skillId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const skill = user.skills.id(skillId);
  if (!skill) throw new Error("Skill not found");
  if (skill.verified) throw new Error("This skill is already verified");

  // Invalidate previous open attempts for this skill
  await VerificationAttempt.deleteMany({
    userId,
    skillId,
    submitted: false,
  });

  const { questions, modelUsed, source } = await generateQuiz(
    skill.name,
    skill.proficiency || "intermediate"
  );

  const attempt = await VerificationAttempt.create({
    userId,
    skillId,
    skillName: skill.name,
    proficiency: skill.proficiency,
    questions,
    modelUsed,
    source,
  });

  return {
    attemptId: attempt._id,
    skillName: skill.name,
    questionCount: questions.length,
    timeLimitSeconds: 600,
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

  const grade = gradeQuiz(attempt.questions, answers);

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
    user.isVerified = true;
  }

  const pointsEarned = grade.verified
    ? POINT_VALUES.VERIFICATION_PASS
    : POINT_VALUES.VERIFICATION_FAIL;
  awardPoints(user, pointsEarned);
  syncVerificationBadges(user);

  await VerificationResult.create({
    userId,
    skillId: attempt.skillId,
    skillName: attempt.skillName,
    score: grade.score,
    totalQuestions: grade.totalQuestions,
    correctAnswers: grade.correctAnswers,
    verified: grade.verified,
    status: grade.status,
    answers: grade.gradedAnswers,
    modelUsed: attempt.modelUsed,
    source: attempt.source,
    timeTakenSeconds,
  });

  await createNotification({
    userId,
    type: grade.verified ? "verification_pass" : "verification_fail",
    title: grade.verified ? "Skill Verified!" : "Verification Failed",
    message: grade.verified
      ? `You passed the ${attempt.skillName} quiz with ${grade.score}% and earned ${pointsEarned} points!`
      : `You scored ${grade.score}% on ${attempt.skillName}. Minimum 70% required. Try again!`,
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
    message: grade.verified
      ? "Congratulations! Your skill has been verified."
      : "Score below 70%. Please review and try again.",
  };
}

module.exports = {
  getVerificationStats,
  startQuiz,
  submitQuiz,
};
