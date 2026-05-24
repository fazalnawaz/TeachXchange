import { useEffect } from "react";
import { Award, XCircle, Trophy, Star, X } from "lucide-react";
import { Link } from "react-router-dom";

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
        className={`relative w-full max-w-md rounded-2xl p-8 text-center shadow-2xl animate-scale-in ${
          passed
            ? "bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800"
            : "bg-white dark:bg-gray-900 border-2 border-red-200 dark:border-red-800"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X size={20} />
        </button>

        {passed ? (
          <>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center animate-badge-pop">
              <Award className="text-white w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Verified!
            </h2>
            <p className="text-green-600 dark:text-green-400 font-semibold text-lg mb-4">
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
            <p className="text-red-600 dark:text-red-400 font-semibold text-lg mb-4">
              {result.score}% — Need 70%+
            </p>
          </>
        )}

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {result.skillName}: {result.correctAnswers}/{result.totalQuestions}{" "}
          correct
        </p>

        {result.pointsEarned > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            <Star size={16} />
            +{result.pointsEarned} points earned
          </div>
        )}

        <div className="flex flex-col gap-2 mt-4">
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
