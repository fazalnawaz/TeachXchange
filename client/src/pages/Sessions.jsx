import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import SessionCountdown from "../components/sessions/SessionCountdown";
import ScheduleSessionModal from "../components/sessions/ScheduleSessionModal";
import FeedbackModal from "../components/sessions/FeedbackModal";
import {
  getSessions,
  confirmSession,
  completeSession,
} from "../services/sessionService";
import { getConnections } from "../services/connectionService";
import { useToast } from "../context/ToastContext";
import {
  Video,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Play,
  Star,
} from "lucide-react";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-700",
};

export default function Sessions() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulePartner, setSchedulePartner] = useState(null);
  const [feedbackSession, setFeedbackSession] = useState(null);
  const [filter, setFilter] = useState("upcoming");

  const load = async () => {
    try {
      const [sessRes, connRes] = await Promise.all([
        getSessions(
          filter === "upcoming"
            ? { upcoming: "true" }
            : filter !== "all"
              ? { status: filter }
              : {}
        ),
        getConnections(),
      ]);
      setSessions(sessRes.data.data || []);
      setConnections(connRes.data.data || []);
    } catch {
      showToast("Failed to load sessions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [filter]);

  useEffect(() => {
    if (location.state?.partnerId && connections.length) {
      const partner = connections.find(
        (c) => String(c.partner._id) === String(location.state.partnerId)
      );
      if (partner) {
        setSchedulePartner(partner.partner);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, connections, navigate, location.pathname]);

  const handleConfirm = async (id) => {
    try {
      await confirmSession(id);
      showToast("Session confirmed", "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to confirm", "error");
    }
  };

  const handleComplete = async (session) => {
    try {
      await completeSession(session._id);
      showToast("Session completed — points awarded!", "success");
      setFeedbackSession(session);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to complete", "error");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Video className="text-purple-600" />
              Learning Sessions
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Schedule, join live video, and track your skill exchanges
            </p>
          </div>
          {connections.length > 0 && (
            <button
              type="button"
              onClick={() => setSchedulePartner(connections[0].partner)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold"
            >
              <Plus size={18} />
              Schedule Session
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {["upcoming", "pending", "confirmed", "completed", "all"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                filter === f
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {sessions.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <Calendar className="mx-auto text-purple-400 mb-3" size={40} />
            <p className="font-medium text-gray-900 dark:text-white">No sessions found</p>
            <p className="text-sm text-gray-500 mt-2">
              Connect with a partner and schedule your first learning session.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm"
              >
                <div className="flex flex-wrap justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {session.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      with {session.partner?.name || "Partner"}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[session.status] || STATUS_STYLES.pending}`}
                  >
                    {session.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(session.scheduledAt).toLocaleString()}
                  </span>
                  {["pending", "confirmed"].includes(session.status) && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-purple-500" />
                      <SessionCountdown targetDate={session.scheduledAt} />
                    </span>
                  )}
                </div>

                {(session.teachSkill || session.learnSkill) && (
                  <p className="text-xs text-purple-700 dark:text-purple-300 mb-4">
                    Teach: {session.teachSkill || "—"} · Learn: {session.learnSkill || "—"}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {session.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleConfirm(session._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold"
                    >
                      <CheckCircle size={14} />
                      Confirm Time
                    </button>
                  )}
                  {["pending", "confirmed"].includes(session.status) && (
                    <Link
                      to={`/sessions/${session._id}/video`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold"
                    >
                      <Play size={14} />
                      Join Live Session
                    </Link>
                  )}
                  {["pending", "confirmed"].includes(session.status) && (
                    <button
                      type="button"
                      onClick={() => handleComplete(session)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold"
                    >
                      Mark Completed
                    </button>
                  )}
                  {session.status === "completed" && (
                    <button
                      type="button"
                      onClick={() => setFeedbackSession(session)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold"
                    >
                      <Star size={14} />
                      Leave Feedback
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {schedulePartner && (
        <ScheduleSessionModal
          partner={schedulePartner}
          onClose={() => setSchedulePartner(null)}
          onScheduled={load}
        />
      )}

      {feedbackSession && (
        <FeedbackModal
          session={feedbackSession}
          onClose={() => setFeedbackSession(null)}
          onSubmitted={load}
        />
      )}
    </Layout>
  );
}
