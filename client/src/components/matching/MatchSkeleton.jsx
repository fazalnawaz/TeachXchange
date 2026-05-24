export default function MatchSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  );
}
