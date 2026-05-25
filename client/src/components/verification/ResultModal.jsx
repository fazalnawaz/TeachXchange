import { useEffect } from "react";
import { Award, XCircle, Trophy, Star, X, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import CategoryBadge from "./CategoryBadge";
import SkillBadge from "./SkillBadge";

export default function ResultModal({ result, onClose }) {
  const passed = result?.verified;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        className={`relative w-full max-w-md rounded-2xl p-8 text-center shadow-2xl animate-scale-in overflow-hidden ${
          passed
            ? "bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800"
            : "bg-white dark:bg-gray-900 border-2 border-red-200 dark:border-red-800"
        }`}
      >
        {passed && (
          <div
            className="absolute inset-0 certificate-shine pointer-events-none opacity-40"
            aria-hidden
          />
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
        >
          <X size={20} />
        </button>

        {passed ? (
          <>
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center animate-badge-pop shadow-lg">
              <Award className="text-white w-12 h-12" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold mb-2">
              <ShieldCheck size={14} />
              VERIFIED CERTIFICATE
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Skill Verified!
            </h2>
            <p className="text-green-600 dark:text-green-400 font-semibold text-lg mb-2">
              {result.score}% — PASSED
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <XCircle className="text-red-500 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Not Verified
            </h2>
            <p className="text-red-600 dark:text-red-400 font-semibold text-lg mb-2">
              {result.score}% — Need {result.passThreshold ?? 70}%+
            </p>
          </>
        )}

        <div className="flex justify-center flex-wrap gap-2 mb-3">
          {result.skillKey && (
            <SkillBadge skillKey={result.skillKey} skillName={result.skillName} />
          )}
          <CategoryBadge
            categoryId={result.skillCategory}
            categoryLabel={result.categoryLabel}
          />
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-medium">
          {result.skillName}
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
          {result.correctAnswers}/{result.totalQuestions} correct • weighted
          category scoring
        </p>

        {result.pointsEarned > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            <Star size={16} />
            +{result.pointsEarned} points earned
          </div>
        )}

        <div className="flex flex-col gap-2 mt-4 relative z-10">
          {passed && (
            <Link
              to="/profile"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <Trophy size={18} />
              View Verified Badge
            </Link>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            {passed ? "Continue" : "Try Again"}
          </button>
        </div>
      </div>
    </div>
  );
}
