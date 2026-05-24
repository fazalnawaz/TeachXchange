import { Clock, CheckCircle, XCircle, ArrowLeftRight } from "lucide-react";

export default function MatchRequestsPanel({
  requests,
  onAccept,
  onReject,
  loading,
}) {
  const pending = requests.filter(
    (r) => r.status === "pending" && r.direction === "received"
  );

  if (pending.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border border-purple-100 dark:border-purple-800">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Clock className="text-purple-600" size={20} />
        Incoming Match Requests ({pending.length})
      </h2>
      <div className="space-y-4">
        {pending.map((req) => (
          <div
            key={req._id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {req.otherUser.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                <ArrowLeftRight size={14} />
                {req.exchangePair?.requesterTeaches} ↔{" "}
                {req.exchangePair?.requesterLearns}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {req.compatibilityScore}% compatibility
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onAccept(req._id)}
                disabled={loading}
                className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle size={16} />
                Accept
              </button>
              <button
                type="button"
                onClick={() => onReject(req._id)}
                disabled={loading}
                className="inline-flex items-center gap-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <XCircle size={16} />
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
