import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import MatchCard from "../components/matching/MatchCard";
import MatchSkeleton from "../components/matching/MatchSkeleton";
import MatchRequestsPanel from "../components/matching/MatchRequestsPanel";
import {
  getMatches,
  getMatchRequests,
  sendMatchRequest,
  acceptMatchRequest,
  rejectMatchRequest,
  refreshMatches,
} from "../services/matchService";
import {
  Search,
  Sparkles,
  ArrowLeftRight,
  Filter,
  RefreshCw,
  BookOpen,
  GraduationCap,
  AlertCircle,
} from "lucide-react";

export default function Browse() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("smart");
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [hint, setHint] = useState("");
  const [userReady, setUserReady] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [totalMatches, setTotalMatches] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [toast, setToast] = useState({ type: "", text: "" });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: "", text: "" }), 4000);
  };

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getMatches({
        search: debouncedSearch.trim(),
        minScore,
        limit: 24,
        verifiedOnly: verifiedOnly ? "1" : "0",
      });
      setMatches(data.matches || []);
      setHint(data.hint || "");
      setUserReady(data.userReady !== false);
      setCurrentUser(data.currentUser || null);
      setTotalMatches(data.total ?? data.matches?.length ?? 0);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? "Please log in again to view matches."
          : "Failed to load matches. Is the server running?");
      showToast("error", msg);
      setMatches([]);
      setTotalMatches(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, minScore, verifiedOnly]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data } = await refreshMatches();
      setMatches(data.matches || []);
      setTotalMatches(data.total ?? 0);
      setCurrentUser(data.currentUser || null);
      showToast("success", "Matches refreshed from database");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const loadRequests = async () => {
    try {
      const { data } = await getMatchRequests();
      setRequests(data || []);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await refreshMatches();
      } catch {
        // fall through to loadMatches
      }
      loadMatches();
      loadRequests();
    };
    init();
  }, [loadMatches]);

  const handleConnect = async (toUserId, message) => {
    setActionLoading(true);
    try {
      await sendMatchRequest(toUserId, message);
      showToast("success", "Skill exchange request sent!");
      await Promise.all([loadMatches(), loadRequests()]);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Could not send request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setActionLoading(true);
    try {
      await acceptMatchRequest(requestId);
      showToast("success", "Match accepted! Check your sessions.");
      await Promise.all([loadMatches(), loadRequests()]);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Could not accept request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(true);
    try {
      await rejectMatchRequest(requestId);
      showToast("success", "Request declined");
      await Promise.all([loadMatches(), loadRequests()]);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Could not decline request");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Find a Skill Exchange Match
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            Mutual learning: teach what you know, learn what you need — no payment
            required. We match users with opposite but compatible skills.
          </p>
        </div>

        {/* Example banner */}
        <div className="glass-card rounded-2xl p-5 mb-8 border border-purple-100 dark:border-purple-800">
          <p className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
            <ArrowLeftRight size={18} />
            How mutual exchange works
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
              <p className="font-medium text-gray-900 dark:text-white">User A</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Teaches <strong>Graphic Design</strong> • Learns{" "}
                <strong>JavaScript</strong>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <p className="font-medium text-gray-900 dark:text-white">User B</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Teaches <strong>JavaScript</strong> • Learns{" "}
                <strong>Graphic Design</strong>
              </p>
            </div>
          </div>
        </div>

        {toast.text && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
            }`}
          >
            <AlertCircle size={18} />
            {toast.text}
          </div>
        )}

        <MatchRequestsPanel
          requests={requests}
          onAccept={handleAccept}
          onReject={handleReject}
          loading={actionLoading}
        />

        {/* Your exchange profile */}
        {currentUser && userReady && (
          <div className="glass-card rounded-2xl p-5 mb-8">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Your exchange profile
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1">
                  <BookOpen size={14} /> You can teach
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentUser.teachSkills?.length > 0 ? (
                    currentUser.teachSkills.map((s) => (
                      <span
                        key={s.name}
                        className="px-2.5 py-1 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 font-medium"
                      >
                        {s.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">None added</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                  <GraduationCap size={14} /> You want to learn
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentUser.learnSkills?.length > 0 ? (
                    currentUser.learnSkills.map((s) => (
                      <span
                        key={s.name}
                        className="px-2.5 py-1 text-xs rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-medium"
                      >
                        {s.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">None added</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab("smart")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              tab === "smart"
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            <Sparkles size={16} className="inline mr-1.5 -mt-0.5" />
            Smart Matches
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 mb-8 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by skill, e.g. React, Python, Design..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-gray-400 shrink-0" />
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value={0}>Any compatibility</option>
              <option value={50}>50%+ match</option>
              <option value={70}>70%+ match</option>
              <option value={85}>85%+ best matches</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Verified only
            </label>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="px-4 py-3 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Sync
            </button>
            <button
              type="button"
              onClick={loadMatches}
              disabled={loading}
              className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition disabled:opacity-50"
              aria-label="Filter matches"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Not ready state */}
        {!userReady && hint && (
          <div className="glass-card rounded-2xl p-10 text-center mb-8">
            <div className="flex justify-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-purple-100 dark:bg-purple-900/40">
                <BookOpen className="text-purple-600" size={32} />
              </div>
              <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/40">
                <GraduationCap className="text-blue-600" size={32} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Complete your profile for matching
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              {hint}
            </p>
            <button
              type="button"
              onClick={() => navigate("/add-skill")}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              Add Teach & Learn Skills
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <MatchSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && userReady && matches.length > 0 && (
          <>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Found <strong>{totalMatches}</strong> mutual exchange match
            {totalMatches !== 1 ? "es" : ""}
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {matches.map((match) => (
              <MatchCard
                key={match.user._id}
                match={match}
                onConnect={handleConnect}
                onAccept={handleAccept}
                onReject={handleReject}
                loading={actionLoading}
              />
            ))}
          </div>
          </>
        )}

        {/* Empty state */}
        {!loading && userReady && matches.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Sparkles className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No mutual matches found yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
              Try adjusting filters, or add more teach/learn skills. Matches appear when
              someone teaches what you want to learn and wants to learn what you teach.
            </p>
            <button
              type="button"
              onClick={() => navigate("/add-skill")}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition"
            >
              Update My Skills
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
