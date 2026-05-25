import { Brain, Sparkles, Cpu } from "lucide-react";
import CategoryBadge from "./CategoryBadge";

const STEPS = [
  "Detecting skill + category...",
  "Building Hugging Face prompt...",
  "Mistral / FLAN generating fresh MCQs...",
  "Validating uniqueness vs your history...",
  "Finalizing your assessment...",
];

export default function GeneratingQuiz({
  skillName,
  skillCategory,
  categoryLabel,
  profileCategory,
}) {
  return (
    <div className="glass-card rounded-2xl p-10 sm:p-14 text-center max-w-lg mx-auto">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-ping opacity-25" />
        <div className="absolute inset-2 rounded-full border-2 border-purple-300 dark:border-purple-600 border-t-transparent animate-spin" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
          <Brain className="text-white w-11 h-11 animate-pulse" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold mb-3">
        <Cpu size={14} />
        100% Hugging Face AI — no local question bank
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Generating your unique quiz
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-3 flex items-center justify-center gap-2 flex-wrap">
        <Sparkles size={16} className="text-purple-500" />
        {skillName}
      </p>
      {(skillCategory || profileCategory) && (
        <div className="mb-6 flex flex-col items-center gap-1">
          {skillCategory ? (
            <CategoryBadge
              categoryId={skillCategory}
              categoryLabel={categoryLabel}
            />
          ) : (
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              Profile category: {profileCategory}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3 text-left mb-6">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400"
          >
            <div
              className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
            {step}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        This may take 30–90 seconds while the model runs on Hugging Face.
      </p>

      <div className="mt-6 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 rounded-full animate-loading-bar" />
      </div>
    </div>
  );
}
