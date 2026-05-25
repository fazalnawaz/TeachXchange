import { CheckCircle2, Code2, Gauge } from "lucide-react";
import QuestionBody from "./QuestionBody";

const TYPE_LABELS = {
  theory: "Theory",
  syntax: "Syntax",
  output: "Code Output",
  debugging: "Debugging",
  practical: "Practical",
  concept: "Concept",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  translation: "Translation",
  correction: "Correction",
  comprehension: "Comprehension",
  conversation: "Conversation",
  tooling: "Tools",
  case_study: "Case Study",
  problem_solving: "Problem Solving",
};

const DIFFICULTY_STYLES = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function McqCard({
  question,
  options,
  selectedIndex,
  onSelect,
  questionNumber,
  questionType,
  difficulty,
  hasCode,
  conceptTag,
}) {
  const typeLabel =
    TYPE_LABELS[questionType] ||
    (questionType || "Question").replace(/_/g, " ");

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm font-bold flex items-center justify-center">
          {questionNumber}
        </span>
        <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 capitalize">
          {typeLabel}
        </span>
        {difficulty && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
              DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.medium
            }`}
          >
            <Gauge size={12} />
            {difficulty}
          </span>
        )}
        {hasCode && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200">
            <Code2 size={12} />
            Code
          </span>
        )}
        {conceptTag && (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 truncate max-w-[140px]">
            {conceptTag.replace(/_/g, " ")}
          </span>
        )}
      </div>

      <div className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-snug mb-6">
        <QuestionBody text={question} hasCode={hasCode} />
      </div>

      <div className="space-y-3">
        {options.map((option, index) => {
          const selected = selectedIndex === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group ${
                selected
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-400 shadow-md"
                  : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 bg-white/50 dark:bg-gray-800/50"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected
                    ? "border-purple-600 bg-purple-600"
                    : "border-gray-300 dark:border-gray-500 group-hover:border-purple-400"
                }`}
              >
                {selected && <CheckCircle2 size={14} className="text-white" />}
              </span>
              <span
                className={`text-sm sm:text-base ${
                  selected
                    ? "text-purple-900 dark:text-purple-100 font-medium"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
