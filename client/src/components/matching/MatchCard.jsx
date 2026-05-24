import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  BookOpen,
  GraduationCap,
  MapPin,
  Star,
  Sparkles,
  CheckCircle,
  Clock,
  X,
  Send,
  MessageCircle,
  Video,
} from "lucide-react";

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
      {initials}
    </div>
  );
}

function getDisplayName(user) {
  if (!user) return "Exchange Partner";
  if (user.name && user.name.trim() && user.name !== "Exchange Partner") {
    return user.name.trim();
  }
  const built = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return built || "Exchange Partner";
}

export default function MatchCard({
  match,
  onConnect,
  onAccept,
  onReject,
  loading,
}) {
  const { user, compatibilityScore, primaryExchange, isBestMatch, requestStatus, requestId } =
    match;
  const displayName = getDisplayName(user);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const handleConnect = () => {
    if (showMessage) {
      onConnect(user._id, message);
      setShowMessage(false);
      setMessage("");
    } else {
      setShowMessage(true);
    }
  };

  return (
    <div
      className={`glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in ${
        isBestMatch ? "ring-2 ring-purple-400 dark:ring-purple-500 shadow-purple-100 dark:shadow-none" : ""
      }`}
    >
      {isBestMatch && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold mb-4 shadow-sm">
          <Sparkles size={12} />
          Best Match
        </div>
      )}

      <div className="flex items-start gap-4 mb-5">
        <Avatar name={displayName} />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {displayName}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {user.location}
            </span>
            <span className="flex items-center gap-1">
              <Star size={14} className="text-amber-500" />
              {(user.rating || 0).toFixed(1)}
            </span>
            {user.isVerified && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle size={14} />
                Verified
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {compatibilityScore}%
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">compatible</p>
        </div>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-100 dark:border-purple-800">
        <p className="text-sm font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-2">
          <ArrowLeftRight size={16} />
          Skill Exchange Match Found
        </p>
      </div>

      {primaryExchange && (
        <div className="mb-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl p-4 bg-white/60 dark:bg-gray-800/60 border border-purple-100 dark:border-purple-800">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1">
                <BookOpen size={14} />
                You teach → They learn
              </p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {primaryExchange.youTeach}
              </p>
              <p className="text-xs text-gray-500 mt-1">↔ their goal: {primaryExchange.theyLearn}</p>
            </div>
            <div className="rounded-xl p-4 bg-white/60 dark:bg-gray-800/60 border border-blue-100 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                <GraduationCap size={14} />
                You learn ← They teach
              </p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {primaryExchange.youLearn}
              </p>
              <p className="text-xs text-gray-500 mt-1">↔ they teach: {primaryExchange.theyTeach}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {user.teachSkills?.slice(0, 4).map((s) => (
          <span
            key={s._id || s.name}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
          >
            Teaches: {s.name}
            {s.verified && <CheckCircle size={12} className="text-green-600" />}
          </span>
        ))}
        {user.learnSkills?.slice(0, 3).map((s) => (
          <span
            key={s._id || s.name}
            className="px-2 py-1 text-xs rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
          >
            Learns: {s.name}
          </span>
        ))}
      </div>

      {showMessage && !requestStatus && (
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional message with your exchange request..."
          rows={2}
          className="w-full mb-3 px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
        />
      )}

      <div className="flex flex-wrap gap-2">
        {!requestStatus && (
          <>
            <button
              type="button"
              onClick={handleConnect}
              disabled={loading}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition disabled:opacity-50"
            >
              <Send size={16} />
              {showMessage ? "Send Request" : "Connect"}
            </button>
            {showMessage && (
              <button
                type="button"
                onClick={() => setShowMessage(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm"
              >
                Cancel
              </button>
            )}
          </>
        )}

        {requestStatus === "pending_sent" && (
          <span className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl text-sm font-medium">
            <Clock size={16} />
            Request Pending
          </span>
        )}

        {requestStatus === "pending_received" && (
          <>
            <button
              type="button"
              onClick={() => onAccept(requestId)}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              <CheckCircle size={16} />
              Accept
            </button>
            <button
              type="button"
              onClick={() => onReject(requestId)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 dark:text-red-400 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
            >
              <X size={16} />
              Decline
            </button>
          </>
        )}

        {requestStatus === "accepted" && (
          <>
            <span className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-sm font-semibold mb-2">
              <CheckCircle size={16} />
              Connected — Start Learning
            </span>
            <Link
              to="/messages"
              state={{
                partnerId: user._id,
                partnerName: displayName,
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
            >
              <MessageCircle size={16} />
              Chat
            </Link>
            <Link
              to="/sessions"
              state={{
                partnerId: user._id,
                partnerName: displayName,
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-xl text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
            >
              <Video size={16} />
              Sessions
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
