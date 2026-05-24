import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Video, Users } from "lucide-react";
import { getConnections } from "../../services/connectionService";

export default function ConnectedPartners() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConnections()
      .then(({ data }) => setConnections(data.data || []))
      .catch(() => setConnections([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center border border-dashed border-purple-200 dark:border-purple-800">
        <Users className="mx-auto text-purple-400 mb-2" size={36} />
        <p className="font-medium text-gray-900 dark:text-white">No connected partners yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Accept a match request to start chatting and scheduling sessions.
        </p>
        <Link
          to="/browse"
          className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Find Matches
        </Link>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map((conn) => (
        <div
          key={conn._id}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {(conn.partner?.name || "?").charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {conn.partner?.name}
              </p>
              <p className="text-xs text-gray-500">
                {conn.compatibilityScore}% match · ★ {(conn.partner?.rating || 0).toFixed(1)}
              </p>
            </div>
          </div>
          {conn.exchangePair && (
            <p className="text-xs text-purple-700 dark:text-purple-300 mb-3 line-clamp-2">
              {conn.exchangePair.requesterTeaches} ↔ {conn.exchangePair.requesterLearns}
            </p>
          )}
          <div className="flex gap-2">
            <Link
              to="/messages"
              state={{
                partnerId: conn.partner._id,
                partnerName: conn.partner.name,
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition"
            >
              <MessageCircle size={14} />
              Chat
            </Link>
            <Link
              to="/sessions"
              state={{ partnerId: conn.partner._id, partnerName: conn.partner.name }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition"
            >
              <Video size={14} />
              Sessions
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
