const crypto = require("crypto");
const { CATEGORY_IDS } = require("./skillCategoryService");

/**
 * Category rules for AI prompts only — no questions, no concept banks.
 */
const CATEGORY_RULES = {
  [CATEGORY_IDS.PROGRAMMING]: `
You are assessing PROGRAMMING skill "{skillName}" ONLY.
- Use real {skillName} syntax, keywords, APIs, and runtime semantics in every question.
- C++, Java, Python, JavaScript, etc. must have COMPLETELY DIFFERENT questions — never swap only the language name.
- Include a mix: theory, syntax, code OUTPUT (short snippet in question text), debugging, practical scenario.
- For OUTPUT/debugging: embed authentic {skillName} code in the question field (plain text, no markdown fences).
- Topics must be native to {skillName} (e.g. C++: pointers/STL/RAII; Java: JVM/GC/collections; Python: GIL/decorators/comprehensions).
- Difficulty: mostly medium and hard. Interview-level.`,
  [CATEGORY_IDS.LANGUAGE]: `
You are assessing HUMAN LANGUAGE skill "{skillName}" ONLY.
- STRICT: NO programming, NO code, NO software development questions.
- Use {skillName} in examples (vocabulary, grammar, translation, correction, comprehension, conversation).
- Questions must be impossible to reuse for another language by renaming.`,
  [CATEGORY_IDS.DESIGN]: `
You are assessing DESIGN skill "{skillName}" ONLY.
- Focus on design principles, tools, UX, visual craft relevant to {skillName}.
- NO programming language questions.`,
  [CATEGORY_IDS.BUSINESS]: `
You are assessing BUSINESS skill "{skillName}" ONLY.
- Scenario-based strategy, metrics, operations, marketing/management as appropriate.
- NO programming or foreign-language grammar questions.`,
  [CATEGORY_IDS.DATA_SCIENCE]: `
You are assessing DATA SCIENCE / ML skill "{skillName}" ONLY.
- Statistics, models, pipelines, evaluation, ethics — specific to {skillName}.`,
  [CATEGORY_IDS.MUSIC_ARTS]: `
You are assessing MUSIC/ARTS skill "{skillName}" ONLY.
- Technique, theory, practice — no unrelated domains.`,
  [CATEGORY_IDS.ACADEMIC]: `
You are assessing ACADEMIC subject "{skillName}" ONLY.
- Rigorous subject-specific concepts and problem solving.`,
  [CATEGORY_IDS.HEALTH_FITNESS]: `
You are assessing HEALTH/FITNESS skill "{skillName}" ONLY.
- Safety, technique, programming wellness concepts.`,
  [CATEGORY_IDS.GENERAL]: `
You are assessing skill "{skillName}".
- Questions must be specific to this skill, not generic templates.`,
};

const PROGRAMMING_TYPES = [
  "theory",
  "syntax",
  "output",
  "debugging",
  "practical",
  "concept",
];

const LANGUAGE_TYPES = [
  "vocabulary",
  "grammar",
  "translation",
  "correction",
  "comprehension",
  "conversation",
];

const DEFAULT_TYPES = ["theory", "concept", "practical"];

function normalizeSkillKey(skillName = "") {
  return String(skillName)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9+#]+/g, "_")
    .replace(/_+$/, "");
}

function seededShuffle(arr, seedHex) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = parseInt(seedHex[(i + 3) % seedHex.length], 16) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Random question-type mix for this session (types only, not content).
 */
function buildQuestionMix(context, sessionSeed, count = 8) {
  const types =
    context.categoryId === CATEGORY_IDS.LANGUAGE
      ? LANGUAGE_TYPES
      : context.categoryId === CATEGORY_IDS.PROGRAMMING
        ? PROGRAMMING_TYPES
        : DEFAULT_TYPES;

  const shuffled = seededShuffle(types, sessionSeed);
  const mix = [];
  for (let i = 0; i < count; i++) {
    mix.push({
      slot: i + 1,
      questionType: shuffled[i % shuffled.length],
      difficulty: seededShuffle(
        ["medium", "hard", "hard", "medium"],
        sessionSeed + String(i)
      )[0],
    });
  }
  return mix;
}

function formatBannedQuestions(questions) {
  if (!questions?.length) return "";
  return `\nBANNED — do not repeat or paraphrase these (already asked this user):\n${questions
    .slice(0, 20)
    .map((q, i) => `${i + 1}. ${String(q).slice(0, 160)}`)
    .join("\n")}`;
}

function formatBannedConcepts(concepts) {
  if (!concepts?.length) return "";
  return `\nBANNED concept tags (use entirely new concepts): ${concepts.join(", ")}`;
}

function buildQuizPrompt(context, meta) {
  const {
    sessionSeed,
    questionMix,
    bannedQuestions = [],
    bannedConcepts = [],
    retryAttempt = 0,
    shortage = 0,
  } = meta;

  const rules =
    (CATEGORY_RULES[context.categoryId] || CATEGORY_RULES[CATEGORY_IDS.GENERAL])
      .replace(/\{skillName\}/g, context.skillName);

  const mixLines = questionMix
    .map(
      (m) =>
        `Slot ${m.slot}: questionType="${m.questionType}", difficulty="${m.difficulty}"`
    )
    .join("\n");

  const forbidLine =
    context.forbidTopics?.length > 0
      ? `\nFORBIDDEN TOPICS: ${context.forbidTopics.join(", ")}`
      : "";

  const retryBlock =
    retryAttempt > 0
      ? `\nRETRY ${retryAttempt}: Previous response was invalid or duplicate. Generate completely NEW questions with different concepts and wording. Need at least ${shortage || 8} valid questions.`
      : "";

  const randomNonce = crypto.randomBytes(6).toString("hex");

  return `You are an expert proctor for TeachXchange skill verification.
SESSION: ${sessionSeed}
NONCE: ${randomNonce}
SKILL: "${context.skillName}"
CATEGORY: ${context.categoryLabel} (${context.categoryId})
PROFILE CATEGORY: ${context.profileCategory}
PROFICIENCY: ${context.proficiency}
EXPERIENCE: ${context.experience} years
${context.description ? `DESCRIPTION: ${context.description}` : ""}

${rules}
${forbidLine}
${formatBannedQuestions(bannedQuestions)}
${formatBannedConcepts(bannedConcepts)}
${retryBlock}

Generate exactly ${questionMix.length} unique multiple-choice questions following this type/difficulty plan:
${mixLines}

ANTI-PATTERNS (reject these):
- Generic templates like "which concept best explains" or "what is fundamental when working with"
- Same question stem with only the technology name changed
- Questions about a different skill than "${context.skillName}"

OUTPUT: Return ONLY a JSON array, no markdown, no commentary:
[
  {
    "question": "full question text",
    "options": ["A","B","C","D"],
    "correctIndex": 0,
    "questionType": "output",
    "difficulty": "hard",
    "hasCode": true,
    "conceptTag": "short_unique_concept_slug"
  }
]

Rules:
- Each conceptTag must be unique and describe the tested concept
- correctIndex 0-3, exactly 4 plausible options
- All questions must be about "${context.skillName}" only
- Majority difficulty medium/hard`;
}

const GENERIC_PATTERNS = [
  /which concept best explains/i,
  /which approach best demonstrates/i,
  /what is a fundamental concept when working with/i,
  /which tool\/practice improves/i,
  /when teaching .+ effectively requires/i,
  /you must ship a .+ feature under time pressure/i,
  /why is .+ important in professional .+ projects/i,
];

function isGenericQuestion(question, context) {
  const q = String(question);
  if (GENERIC_PATTERNS.some((p) => p.test(q))) return true;
  if (q.length < 20) return true;

  if (context.categoryId === CATEGORY_IDS.LANGUAGE) {
    if (/\b(code|programming|syntax|compiler|variable|function)\b/i.test(q)) {
      return true;
    }
  }

  if (context.categoryId === CATEGORY_IDS.PROGRAMMING) {
    const skill = context.skillName.toLowerCase();
    const siblings = ["c++", "java", "python", "javascript", "c#", "ruby", "go"];
    for (const sib of siblings) {
      if (sib !== skill && q.toLowerCase().includes(sib) && !q.toLowerCase().includes(skill)) {
        return true;
      }
    }
  }

  return false;
}

module.exports = {
  buildQuizPrompt,
  buildQuestionMix,
  isGenericQuestion,
  normalizeSkillKey,
};
