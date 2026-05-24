import { CheckCircle2 } from "lucide-react";

export default function McqCard({
  question,
  options,
  selectedIndex,
  onSelect,
  questionNumber,
}) {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in">
      <div className="flex items-start gap-3 mb-6">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm font-bold flex items-center justify-center">
          {questionNumber}
        </span>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-snug">
          {question}
        </h3>
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
