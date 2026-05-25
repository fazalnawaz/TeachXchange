/**
 * Detects verification category from skill name + user-selected profile category.
 * Drives category-specific AI prompts (Hugging Face only).
 */

const CATEGORY_IDS = {
  PROGRAMMING: "programming",
  LANGUAGE: "language",
  DESIGN: "design",
  BUSINESS: "business",
  DATA_SCIENCE: "data_science",
  MUSIC_ARTS: "music_arts",
  ACADEMIC: "academic",
  HEALTH_FITNESS: "health_fitness",
  GENERAL: "general",
};

const PROFILE_CATEGORY_MAP = {
  "programming & development": CATEGORY_IDS.PROGRAMMING,
  "data science & ai": CATEGORY_IDS.DATA_SCIENCE,
  "design & creative": CATEGORY_IDS.DESIGN,
  "business & marketing": CATEGORY_IDS.BUSINESS,
  "digital marketing": CATEGORY_IDS.BUSINESS,
  "language learning": CATEGORY_IDS.LANGUAGE,
  "music & arts": CATEGORY_IDS.MUSIC_ARTS,
  "photography & video": CATEGORY_IDS.DESIGN,
  "academic tutoring": CATEGORY_IDS.ACADEMIC,
  "health & fitness": CATEGORY_IDS.HEALTH_FITNESS,
  "personal development": CATEGORY_IDS.GENERAL,
  other: CATEGORY_IDS.GENERAL,
  general: CATEGORY_IDS.GENERAL,
};

const SKILL_KEYWORDS = {
  [CATEGORY_IDS.PROGRAMMING]: [
    "javascript", "typescript", "python", "java", "c++", "cpp", "c#", "csharp",
    "react", "node", "nodejs", "angular", "vue", "django", "flask", "spring",
    "kotlin", "swift", "rust", "go", "golang", "php", "ruby", "html", "css",
    "sql", "mongodb", "express", "next.js", "nextjs", "laravel", "flutter",
    "dart", "assembly", "matlab", "r programming", "bash", "shell",
  ],
  [CATEGORY_IDS.LANGUAGE]: [
    "german", "deutsch", "english", "urdu", "arabic", "french", "spanish",
    "italian", "portuguese", "chinese", "mandarin", "japanese", "korean",
    "hindi", "punjabi", "turkish", "russian", "dutch", "swedish", "norwegian",
    "polish", "greek", "hebrew", "bengali", "pashto", "persian", "farsi",
  ],
  [CATEGORY_IDS.DESIGN]: [
    "photoshop", "illustrator", "figma", "ui/ux", "ui ux", "graphic design",
    "indesign", "sketch", "canva", "after effects", "premiere", "blender",
    "3d modeling", "logo design", "branding", "typography", "web design",
  ],
  [CATEGORY_IDS.BUSINESS]: [
    "marketing", "management", "finance", "accounting", "entrepreneurship",
    "sales", "hr", "human resources", "project management", "seo", "sem",
    "content marketing", "business strategy", "economics", "leadership",
  ],
  [CATEGORY_IDS.DATA_SCIENCE]: [
    "machine learning", "deep learning", "data science", "tensorflow",
    "pytorch", "pandas", "numpy", "statistics", "data analysis", "nlp",
    "computer vision", "neural network", "scikit", "tableau", "power bi",
  ],
  [CATEGORY_IDS.MUSIC_ARTS]: [
    "guitar", "piano", "violin", "singing", "music theory", "drawing",
    "painting", "sculpture", "theater", "dance", "composition",
  ],
  [CATEGORY_IDS.ACADEMIC]: [
    "mathematics", "math", "physics", "chemistry", "biology", "history",
    "geography", "literature", "calculus", "algebra", "geometry",
  ],
  [CATEGORY_IDS.HEALTH_FITNESS]: [
    "yoga", "fitness", "nutrition", "personal training", "meditation",
    "pilates", "crossfit", "wellness",
  ],
};

const CATEGORY_META = {
  [CATEGORY_IDS.PROGRAMMING]: {
    label: "Programming & Development",
    questionTypes: [
      "theory",
      "syntax",
      "output",
      "debugging",
      "practical",
      "concept",
    ],
    difficulties: ["medium", "hard"],
  },
  [CATEGORY_IDS.LANGUAGE]: {
    label: "Language Learning",
    questionTypes: [
      "vocabulary",
      "grammar",
      "translation",
      "correction",
      "comprehension",
      "conversation",
    ],
    difficulties: ["easy", "medium", "hard"],
  },
  [CATEGORY_IDS.DESIGN]: {
    label: "Design & Creative",
    questionTypes: ["theory", "practical", "concept", "tooling"],
    difficulties: ["medium", "hard"],
  },
  [CATEGORY_IDS.BUSINESS]: {
    label: "Business & Marketing",
    questionTypes: ["theory", "concept", "practical", "case_study"],
    difficulties: ["medium", "hard"],
  },
  [CATEGORY_IDS.DATA_SCIENCE]: {
    label: "Data Science & AI",
    questionTypes: ["theory", "practical", "concept", "output"],
    difficulties: ["medium", "hard"],
  },
  [CATEGORY_IDS.MUSIC_ARTS]: {
    label: "Music & Arts",
    questionTypes: ["theory", "practical", "concept"],
    difficulties: ["easy", "medium", "hard"],
  },
  [CATEGORY_IDS.ACADEMIC]: {
    label: "Academic",
    questionTypes: ["theory", "concept", "problem_solving"],
    difficulties: ["medium", "hard"],
  },
  [CATEGORY_IDS.HEALTH_FITNESS]: {
    label: "Health & Fitness",
    questionTypes: ["theory", "practical", "concept"],
    difficulties: ["easy", "medium", "hard"],
  },
  [CATEGORY_IDS.GENERAL]: {
    label: "General Skills",
    questionTypes: ["theory", "concept", "practical"],
    difficulties: ["medium", "hard"],
  },
};

function normalizeKey(str = "") {
  return String(str).toLowerCase().trim();
}

function detectFromSkillName(skillName) {
  const name = normalizeKey(skillName);
  for (const [categoryId, keywords] of Object.entries(SKILL_KEYWORDS)) {
    for (const kw of keywords) {
      if (name === kw || name.includes(kw)) {
        return categoryId;
      }
    }
  }
  return null;
}

function detectFromProfileCategory(profileCategory) {
  const key = normalizeKey(profileCategory);
  return PROFILE_CATEGORY_MAP[key] || null;
}

/**
 * @param {{ name: string, category?: string, proficiency?: string, experience?: number, description?: string }} skill
 */
function detectSkillContext(skill) {
  const skillName = String(skill.name || "").trim();
  const profileCategory = skill.category || "General";

  const fromName = detectFromSkillName(skillName);
  const fromProfile = detectFromProfileCategory(profileCategory);

  let categoryId = fromName || fromProfile || CATEGORY_IDS.GENERAL;

  // Profile category wins when skill name is ambiguous but user picked Language Learning
  if (!fromName && fromProfile) {
    categoryId = fromProfile;
  }
  // Strong name signal overrides generic profile (e.g. German under wrong category)
  if (fromName) {
    categoryId = fromName;
  }

  const meta = CATEGORY_META[categoryId] || CATEGORY_META[CATEGORY_IDS.GENERAL];

  return {
    categoryId,
    categoryLabel: meta.label,
    skillName,
    profileCategory,
    proficiency: skill.proficiency || "intermediate",
    experience: skill.experience || 0,
    description: skill.description || "",
    questionTypes: meta.questionTypes,
    difficulties: meta.difficulties,
    forbidTopics:
      categoryId === CATEGORY_IDS.LANGUAGE
        ? ["programming", "code syntax", "software development", "algorithms"]
        : categoryId === CATEGORY_IDS.PROGRAMMING
          ? ["foreign language grammar", "translation to German"]
          : [],
  };
}

module.exports = {
  CATEGORY_IDS,
  CATEGORY_META,
  detectSkillContext,
  detectFromSkillName,
};
