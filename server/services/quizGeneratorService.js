const crypto = require("crypto");
const { generateWithFallback } = require("./huggingFaceService");

const QUESTION_COUNT = 5;
const PASS_THRESHOLD = 70;

/**
 * Extract JSON array from model output text.
 */
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

/**
 * Normalize and validate question objects from AI or fallback.
 */
function normalizeQuestions(rawQuestions, skillName) {
  const valid = [];

  for (let i = 0; i < rawQuestions.length && valid.length < QUESTION_COUNT; i++) {
    const item = rawQuestions[i];
    const question = String(item.question || item.q || "").trim();
    let options = item.options || item.choices || [];

    if (!Array.isArray(options)) options = [];
    options = options.map((o) => String(o).trim()).filter(Boolean);

    if (options.length < 4) continue;

    options = options.slice(0, 4);
    let correctIndex = Number(item.correctIndex ?? item.answer ?? 0);
    if (Number.isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      correctIndex = 0;
    }

    valid.push({
      questionId: `q_${valid.length + 1}_${crypto.randomBytes(4).toString("hex")}`,
      question: question.includes(skillName)
        ? question
        : `${question} (${skillName})`,
      options,
      correctIndex,
    });
  }

  return valid;
}

/**
 * Dynamic fallback: skill-specific templates (not a fixed global quiz).
 */
function generateDynamicFallbackQuiz(skillName, proficiency = "intermediate") {
  const seed = crypto
    .createHash("md5")
    .update(`${skillName}-${proficiency}-${Date.now()}`)
    .digest("hex");

  const pick = (arr, index) => arr[parseInt(seed[index], 16) % arr.length];

  const concepts = [
    "core syntax and fundamentals",
    "common design patterns",
    "debugging and error handling",
    "performance optimization",
    "best practices and tooling",
    "security considerations",
    "testing strategies",
    "architecture principles",
  ];

  const templates = [
    {
      q: `What is a fundamental concept when working with ${skillName}?`,
      opts: [
        `Ignoring ${pick(concepts, 0)}`,
        `Mastering ${pick(concepts, 1)}`,
        `Avoiding documentation`,
        `Skipping code reviews`,
      ],
      correct: 1,
    },
    {
      q: `Which approach best demonstrates ${proficiency}-level ${skillName} knowledge?`,
      opts: [
        "Writing unmaintainable code quickly",
        `Applying ${pick(concepts, 2)} consistently`,
        "Copying without understanding",
        "Avoiding version control",
      ],
      correct: 1,
    },
    {
      q: `In ${skillName}, how should you handle complex problems?`,
      opts: [
        "Break them into smaller testable parts",
        "Ignore edge cases",
        "Hardcode all values",
        "Disable error logging",
      ],
      correct: 0,
    },
    {
      q: `What is essential for ${skillName} project quality?`,
      opts: [
        `${pick(concepts, 3)} and readable code`,
        "No testing",
        "Single massive files",
        "No collaboration",
      ],
      correct: 0,
    },
    {
      q: `Which tool/practice improves ${skillName} development workflow?`,
      opts: [
        "Random debugging only",
        `Using ${pick(concepts, 4)} and linters`,
        "No build process",
        "Manual deployment only",
      ],
      correct: 1,
    },
    {
      q: `When teaching ${skillName}, what builds learner trust?`,
      opts: [
        "Verified expertise and clear explanations",
        "Skipping assessments",
        "No examples",
        "Outdated methods only",
      ],
      correct: 0,
    },
  ];

  // Shuffle order based on seed
  const shuffled = [...templates].sort(
    (a, b) =>
      parseInt(seed[a.q.length % seed.length], 16) -
      parseInt(seed[b.q.length % seed.length], 16)
  );

  return shuffled.slice(0, QUESTION_COUNT).map((t, idx) => {
    const options = [...t.opts];
    // Shuffle options but track correct answer
    const correctOption = options[t.correct];
    for (let i = options.length - 1; i > 0; i--) {
      const j = parseInt(seed[(idx + i) % seed.length], 16) % (i + 1);
      [options[i], options[j]] = [options[j], options[i]];
    }
    const correctIndex = options.indexOf(correctOption);

    return {
      questionId: `fb_${idx + 1}_${crypto.randomBytes(4).toString("hex")}`,
      question: t.q,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    };
  });
}

/**
 * Build prompt for Hugging Face MCQ generation.
 */
function buildQuizPrompt(skillName, proficiency, count = QUESTION_COUNT) {
  return `Generate exactly ${count} multiple choice questions to test ${proficiency} level knowledge of ${skillName}. Return ONLY a JSON array with this format: [{"question":"text","options":["A","B","C","D"],"correctIndex":0}]. Questions must be specific to ${skillName}. No explanation text.`;
}

/**
 * Generate quiz via AI with dynamic fallback.
 */
async function generateQuiz(skillName, proficiency = "intermediate") {
  const prompt = buildQuizPrompt(skillName, proficiency);

  try {
    const { text, modelUsed, source } = await generateWithFallback(prompt);
    const parsed = extractJsonArray(text);
    const questions = normalizeQuestions(parsed || [], skillName);

    if (questions.length >= QUESTION_COUNT) {
      return {
        questions: questions.slice(0, QUESTION_COUNT),
        modelUsed,
        source,
      };
    }

    console.warn("AI returned insufficient questions, using dynamic fallback");
  } catch (error) {
    console.warn("AI quiz generation failed:", error.message);
  }

  return {
    questions: generateDynamicFallbackQuiz(skillName, proficiency),
    modelUsed: "dynamic-fallback",
    source: "fallback",
  };
}

/**
 * Grade submitted answers against attempt questions.
 */
function gradeQuiz(questions, answers) {
  let correct = 0;
  const gradedAnswers = questions.map((q) => {
    const userAnswer = answers.find((a) => a.questionId === q.questionId);
    const selectedIndex =
      userAnswer !== undefined ? Number(userAnswer.selectedIndex) : -1;
    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) correct += 1;

    return {
      questionId: q.questionId,
      selectedIndex,
      isCorrect,
    };
  });

  const score = Math.round((correct / questions.length) * 100);
  const verified = score >= PASS_THRESHOLD;

  return {
    score,
    verified,
    status: verified ? "PASSED" : "FAILED",
    correctAnswers: correct,
    totalQuestions: questions.length,
    gradedAnswers,
  };
}

module.exports = {
  generateQuiz,
  gradeQuiz,
  QUESTION_COUNT,
  PASS_THRESHOLD,
};
