const crypto = require("crypto");
const { generateWithFallback } = require("./huggingFaceService");
const { detectSkillContext } = require("./skillCategoryService");
const {
  buildQuizPrompt,
  buildQuestionMix,
  isGenericQuestion,
  normalizeSkillKey,
} = require("./aiQuizPromptService");

const QUESTION_COUNT = 8;
const PASS_THRESHOLD = 70;
const MAX_GENERATION_ATTEMPTS = 4;

const TYPE_WEIGHTS = {
  programming: {
    practical: 1.5,
    output: 1.35,
    debugging: 1.35,
    syntax: 1.2,
    theory: 1,
    concept: 1,
    default: 1,
  },
  language: {
    grammar: 1.25,
    translation: 1.2,
    correction: 1.2,
    comprehension: 1.15,
    vocabulary: 1,
    conversation: 1,
    default: 1,
  },
  default: { default: 1 },
};

function questionHash(text) {
  return crypto
    .createHash("sha256")
    .update(String(text).toLowerCase().replace(/\s+/g, " ").trim())
    .digest("hex")
    .slice(0, 16);
}

function extractJsonArray(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/gi, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function detectCodeInQuestion(text) {
  const t = String(text);
  return (
    /```[\s\S]*?```/.test(t) ||
    /#include\s*</.test(t) ||
    /\b(public\s+class|def\s+\w+|function\s+\w+|console\.log|System\.out|std::)/.test(t) ||
    /What is the output|Predict the|following code/i.test(t)
  );
}

function normalizeQuestions(rawQuestions, context, excludeHashes = new Set()) {
  const valid = [];
  const usedHashes = new Set(excludeHashes);
  const usedConcepts = new Set();

  for (let i = 0; i < rawQuestions.length && valid.length < QUESTION_COUNT; i++) {
    const item = rawQuestions[i];
    const question = String(item.question || item.q || "").trim();
    let options = item.options || item.choices || [];

    if (!question || question.length < 18) continue;
    if (isGenericQuestion(question, context)) continue;

    if (!Array.isArray(options)) options = [];
    options = options.map((o) => String(o).trim()).filter(Boolean);
    if (options.length < 4) continue;
    options = options.slice(0, 4);

    let correctIndex = Number(item.correctIndex ?? item.answer ?? 0);
    if (Number.isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      correctIndex = 0;
    }

    const hash = questionHash(question);
    if (usedHashes.has(hash)) continue;

    const conceptTag = String(item.conceptTag || item.concept || `ai_${valid.length + 1}`)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    if (usedConcepts.has(conceptTag) && valid.length >= 4) continue;

    usedHashes.add(hash);
    usedConcepts.add(conceptTag);

    valid.push({
      questionId: `q_${valid.length + 1}_${crypto.randomBytes(4).toString("hex")}`,
      question,
      options,
      correctIndex,
      questionType: String(item.questionType || "theory")
        .toLowerCase()
        .replace(/\s+/g, "_"),
      difficulty: ["easy", "medium", "hard"].includes(
        String(item.difficulty || "").toLowerCase()
      )
        ? String(item.difficulty).toLowerCase()
        : "medium",
      hasCode: Boolean(item.hasCode) || detectCodeInQuestion(question),
      questionHash: hash,
      conceptTag,
    });
  }

  return valid;
}

async function getVerificationHistory(userId, skillName) {
  const VerificationAttempt = require("../models/VerificationAttempt");
  const SkillQuestionHistory = require("../models/SkillQuestionHistory");

  const [attempts, history] = await Promise.all([
    VerificationAttempt.find({ userId, skillName })
      .select("questions askedConcepts")
      .lean(),
    SkillQuestionHistory.find({ userId, skillName })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean(),
  ]);

  const questions = [];
  const concepts = new Set();
  const hashes = new Set();

  for (const a of attempts) {
    for (const q of a.questions || []) {
      if (q.question) questions.push(q.question);
      if (q.questionHash) hashes.add(q.questionHash);
      if (q.conceptTag) concepts.add(q.conceptTag);
    }
    for (const c of a.askedConcepts || []) concepts.add(c);
  }

  for (const h of history) {
    for (const c of h.conceptTags || []) concepts.add(c);
    for (const hash of h.questionHashes || []) hashes.add(hash);
  }

  return {
    questions,
    concepts: [...concepts],
    hashes: [...hashes],
  };
}

async function getPreviouslyAskedQuestions(userId, skillName) {
  const { questions } = await getVerificationHistory(userId, skillName);
  return questions;
}

/**
 * Generate quiz exclusively via Hugging Face (no local question banks).
 */
async function generateQuiz(skill, options = {}) {
  if (!process.env.HF_API_KEY) {
    throw new Error(
      "HF_API_KEY is not configured. Add your Hugging Face token to server .env to enable AI verification."
    );
  }

  const context = detectSkillContext(skill);
  const sessionSeed =
    options.sessionSeed || crypto.randomBytes(16).toString("hex");

  const prior = options.priorHistory || {
    questions: options.excludeQuestions || [],
    concepts: options.excludeConcepts || [],
    hashes: [],
  };

  const excludeHashes = new Set([
    ...prior.hashes,
    ...prior.questions.map((t) => questionHash(t)),
  ]);

  const questionMix = buildQuestionMix(context, sessionSeed, QUESTION_COUNT);

  let bestQuestions = [];
  let modelUsed = process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";
  let lastError = null;

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const prompt = buildQuizPrompt(context, {
      sessionSeed: `${sessionSeed}-a${attempt}`,
      questionMix,
      bannedQuestions: [
        ...prior.questions,
        ...bestQuestions.map((q) => q.question),
      ],
      bannedConcepts: [
        ...prior.concepts,
        ...bestQuestions.map((q) => q.conceptTag),
      ],
      retryAttempt: attempt,
      shortage: QUESTION_COUNT - bestQuestions.length,
    });

    try {
      const { text, modelUsed: used } = await generateWithFallback(prompt, {
        temperature: 0.62 + attempt * 0.08,
        max_new_tokens: 3000,
      });
      modelUsed = used;

      const parsed = extractJsonArray(text);
      const batch = normalizeQuestions(
        parsed || [],
        context,
        new Set([...excludeHashes, ...bestQuestions.map((q) => q.questionHash)])
      );

      const seen = new Set(bestQuestions.map((q) => q.questionHash));
      for (const q of batch) {
        if (!seen.has(q.questionHash) && bestQuestions.length < QUESTION_COUNT) {
          bestQuestions.push(q);
          seen.add(q.questionHash);
        }
      }

      if (bestQuestions.length >= QUESTION_COUNT) break;
    } catch (err) {
      lastError = err;
      console.warn(`HF quiz attempt ${attempt + 1} failed:`, err.message);
    }
  }

  if (bestQuestions.length < QUESTION_COUNT) {
    throw new Error(
      lastError
        ? `AI could not generate enough unique questions (${bestQuestions.length}/${QUESTION_COUNT}). ${lastError.message}`
        : `AI returned insufficient valid questions (${bestQuestions.length}/${QUESTION_COUNT}). Please try again.`
    );
  }

  const questions = bestQuestions.slice(0, QUESTION_COUNT);

  return {
    questions,
    modelUsed,
    source: "ai",
    skillCategory: context.categoryId,
    categoryLabel: context.categoryLabel,
    skillKey: normalizeSkillKey(context.skillName),
    sessionSeed,
    askedConcepts: questions.map((q) => q.conceptTag).filter(Boolean),
  };
}

function getTypeWeight(categoryId, questionType) {
  const weights = TYPE_WEIGHTS[categoryId] || TYPE_WEIGHTS.default;
  return weights[questionType] || weights.default || 1;
}

function gradeQuiz(questions, answers, skillCategory = "general") {
  let earned = 0;
  let possible = 0;
  let correct = 0;

  const gradedAnswers = questions.map((q) => {
    const userAnswer = answers.find((a) => a.questionId === q.questionId);
    const selectedIndex =
      userAnswer !== undefined ? Number(userAnswer.selectedIndex) : -1;
    const isCorrect = selectedIndex === q.correctIndex;
    const weight = getTypeWeight(skillCategory, q.questionType);

    possible += weight;
    if (isCorrect) {
      correct += 1;
      earned += weight;
    }

    return {
      questionId: q.questionId,
      selectedIndex,
      isCorrect,
      questionType: q.questionType,
      difficulty: q.difficulty,
      conceptTag: q.conceptTag,
      weight,
    };
  });

  const score = possible > 0 ? Math.round((earned / possible) * 100) : 0;

  return {
    score,
    verified: score >= PASS_THRESHOLD,
    status: score >= PASS_THRESHOLD ? "PASSED" : "FAILED",
    correctAnswers: correct,
    totalQuestions: questions.length,
    gradedAnswers,
    passThreshold: PASS_THRESHOLD,
    skillCategory,
  };
}

module.exports = {
  generateQuiz,
  gradeQuiz,
  getPreviouslyAskedQuestions,
  getVerificationHistory,
  questionHash,
  QUESTION_COUNT,
  PASS_THRESHOLD,
  normalizeSkillKey,
};
