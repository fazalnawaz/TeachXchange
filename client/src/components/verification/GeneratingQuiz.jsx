import { Brain, Sparkles } from "lucide-react";

const STEPS = [
  "Connecting to Hugging Face AI...",
  "Analyzing your skill profile...",
  "Generating custom MCQ questions...",
  "Preparing your assessment...",
];

export default function GeneratingQuiz({ skillName }) {
  return (
    <div className="glass-card rounded-2xl p-10 sm:p-14 text-center max-w-lg mx-auto">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-ping opacity-20" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
          <Brain className="text-white w-10 h-10 animate-pulse" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        AI is building your quiz
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 flex items-center justify-center gap-2">
        <Sparkles size={16} className="text-purple-500" />
        {skillName}
      </p>

      <div className="space-y-3 text-left">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400"
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
            {step}
          </div>
        ))}
      </div>

      <div className="mt-8 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-loading-bar" />
      </div>
    </div>
  );
}
