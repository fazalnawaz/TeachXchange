import { useCallback, useState } from "react";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import McqCard from "./McqCard";
import QuizProgress from "./QuizProgress";
import QuizTimer from "./QuizTimer";
import CategoryBadge from "./CategoryBadge";
import SkillBadge from "./SkillBadge";

export default function SkillTest({ quiz, onSubmit, onCancel, submitting }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime] = useState(Date.now());

  const questions = quiz?.questions || [];
  const current = questions[currentIndex];
  const total = questions.length;
  const passThreshold = quiz.passThreshold ?? 70;

  const handleSelect = (index) => {
    if (!current) return;
    setAnswers((prev) => ({
      ...prev,
      [current.questionId]: index,
    }));
  };

  const handleNext = () => {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSubmit = useCallback(() => {
    const formatted = questions.map((q) => ({
      questionId: q.questionId,
      selectedIndex: answers[q.questionId] ?? -1,
    }));
    const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);
    onSubmit(formatted, timeTakenSeconds);
  }, [answers, questions, onSubmit, startTime]);

  const handleExpire = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  const allAnswered = questions.every(
    (q) => answers[q.questionId] !== undefined
  );
  const isLast = currentIndex === total - 1;
  const answeredCount = Object.keys(answers).length;

  if (!current) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {quiz.skillName} Assessment
            </h2>
            <SkillBadge
              skillKey={quiz.skillKey}
              skillName={quiz.skillName}
              size="sm"
            />
            <CategoryBadge
              categoryId={quiz.skillCategory}
              categoryLabel={quiz.categoryLabel}
              size="sm"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hugging Face AI • {total} questions • Pass: {passThreshold}% •{" "}
            {answeredCount}/{total} answered
          </p>
        </div>
        <QuizTimer
          totalSeconds={quiz.timeLimitSeconds || 900}
          onExpire={handleExpire}
          active={!submitting}
        />
      </div>

      <QuizProgress current={currentIndex + 1} total={total} />

      <div key={current.questionId} className="animate-quiz-slide">
        <McqCard
          question={current.question}
          options={current.options}
          selectedIndex={answers[current.questionId]}
          onSelect={handleSelect}
          questionNumber={currentIndex + 1}
          questionType={current.questionType}
          difficulty={current.difficulty}
          hasCode={current.hasCode}
          conceptTag={current.conceptTag}
        />
      </div>

      <div className="flex flex-wrap gap-3 justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-purple-600 transition"
        >
          <ArrowLeft size={18} />
          Cancel
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Previous
          </button>

          {!isLast ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={answers[current.questionId] === undefined}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium disabled:opacity-50 hover:shadow-lg transition"
            >
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold disabled:opacity-50 hover:shadow-lg transition"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {questions.map((q, i) => (
          <button
            key={q.questionId}
            type="button"
            onClick={() => setCurrentIndex(i)}
            title={q.questionType ? `${q.questionType} • ${q.difficulty}` : undefined}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
              i === currentIndex
                ? "bg-purple-600 text-white"
                : answers[q.questionId] !== undefined
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
