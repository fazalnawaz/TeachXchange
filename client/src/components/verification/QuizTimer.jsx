import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function QuizTimer({ totalSeconds, onExpire, active }) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (!active) return;
    setRemaining(totalSeconds);
  }, [active, totalSeconds]);

  useEffect(() => {
    if (!active || remaining <= 0) return;

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [active, remaining, onExpire]);

  const isLow = remaining <= 60;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-semibold text-sm border backdrop-blur-sm ${
        isLow
          ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 animate-pulse"
          : "bg-white/80 border-purple-100 text-purple-700 dark:bg-gray-800/80 dark:border-gray-600 dark:text-purple-300"
      }`}
    >
      <Clock size={16} />
      {formatTime(remaining)}
    </div>
  );
}
