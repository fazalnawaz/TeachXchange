export default function QuizProgress({ current, total }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-600 dark:text-gray-300">
          Question {current} of {total}
        </span>
        <span className="font-semibold text-purple-600 dark:text-purple-400">
          {percent}%
        </span>
      </div>
      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
