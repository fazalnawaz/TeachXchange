import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { API_URL } from "../config";
import { getVerificationStats } from "../services/verificationService";
import MatchCard from "../components/matching/MatchCard";
import {
  getMatchStats,
  getMatchRequests,
  refreshMatches,
  sendMatchRequest,
  acceptMatchRequest,
  rejectMatchRequest,
} from "../services/matchService";
import MatchRequestsPanel from "../components/matching/MatchRequestsPanel";
import {
  Search,
  BookOpen,
  Award,
  Brain,
  Video,
  MessageCircle,
  Trophy,
  ArrowRight,
  Sparkles,
  Clock,
  Star,
  Target,
  TrendingUp,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Users,
  ArrowLeftRight,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    title: "Find Skills to Learn",
    desc: "Browse peers offering skills you want to acquire.",
    to: "/browse",
    icon: Search,
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    title: "Offer Your Skills",
    desc: "Share what you know and help others grow.",
    to: "/add-skill",
    icon: BookOpen,
    gradient: "from-purple-500 to-violet-500",
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
  {
    title: "Verify a Skill",
    desc: "Complete AI verification and earn trust badges.",
    to: "/skill-verification",
    icon: Award,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    title: "My Sessions",
    desc: "Join or schedule live learning sessions.",
    to: "/sessions",
    icon: Video,
    gradient: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    text: "text-pink-600",
  },
  {
    title: "Messages",
    desc: "Chat with your learning partners.",
    to: "/messages",
    icon: MessageCircle,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    title: "Leaderboard",
    desc: "Track your rank and community progress.",
    to: "/leaderboard",
    icon: Trophy,
    gradient: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatSessionDate(date) {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [verificationStats, setVerificationStats] = useState(null);
  const [matchStats, setMatchStats] = useState(null);
  const [matchRequests, setMatchRequests] = useState([]);
  const [matchActionLoading, setMatchActionLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [profileRes, sessionsRes, messagesRes, verifyRes, matchRes, requestsRes] =
          await Promise.allSettled([
            axios.get(`${API_URL}/api/users/profile`, { headers }),
            axios.get(`${API_URL}/api/users/sessions`, { headers }),
            axios.get(`${API_URL}/api/users/messages`, { headers }),
            getVerificationStats(),
            refreshMatches().catch(() => getMatchStats()),
            getMatchRequests(),
          ]);

        if (profileRes.status === "fulfilled") {
          const p = profileRes.value.data;
          setProfile(p);
          if (p?.name) localStorage.setItem("userName", p.name);
        }
        if (sessionsRes.status === "fulfilled") setSessions(sessionsRes.value.data || []);
        if (messagesRes.status === "fulfilled") setMessages(messagesRes.value.data || []);
        if (verifyRes.status === "fulfilled") setVerificationStats(verifyRes.value.data);
        if (matchRes.status === "fulfilled") setMatchStats(matchRes.value.data);
        if (requestsRes.status === "fulfilled") setMatchRequests(requestsRes.value.data || []);
      } catch {
        // Dashboard still renders with defaults
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const userRole = localStorage.getItem("userRole") || "learner";
  const profileName =
    profile?.name || localStorage.getItem("userName") || "there";
  const firstName = profileName.split(" ")[0] || "there";

  const teachSkills = profile?.teachSkills || profile?.skills || [];
  const learnSkills = profile?.learnSkills || profile?.learningGoals || [];
  const verifiedCount = teachSkills.filter((s) => s.verified).length;
  const pendingVerification = teachSkills.filter((s) => !s.verified).length;
  const unreadMessages = messages.filter((m) => !m.read).length;
  const upcomingSessions = sessions
    .filter((s) => s.status === "upcoming")
    .slice(0, 3);
  const recentMessages = messages.slice(0, 4);

  const stats = [
    {
      label: "Skills to Teach",
      value: teachSkills.length,
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Learning Goals",
      value: learnSkills.length,
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Total Sessions",
      value: profile?.totalSessions ?? sessions.length,
      icon: Video,
      color: "text-pink-600",
      bg: "bg-pink-100",
    },
    {
      label: "Your Rating",
      value: (profile?.rating ?? 0).toFixed(1),
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-100",
      suffix: "/5",
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 p-8 sm:p-10 text-white shadow-xl shadow-purple-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-xl" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sm font-medium mb-4 backdrop-blur-sm">
                <Sparkles size={14} />
                <span className="capitalize">{userRole} account</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                {getGreeting()}, {firstName}!
              </h1>
              <p className="text-purple-100 text-lg max-w-xl">
                Your TeachXchange dashboard — track progress, connect with peers, and grow your skills.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl font-semibold text-sm hover:bg-purple-50 transition shadow-lg"
              >
                <Search size={18} />
                Find a Match
              </Link>
              <Link
                to="/add-skill"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white border border-white/30 rounded-xl font-semibold text-sm hover:bg-white/25 transition backdrop-blur-sm"
              >
                <BookOpen size={18} />
                Add Skill
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <Icon size={20} className={stat.color} />
                  </div>
                  <TrendingUp size={16} className="text-gray-300" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-sm font-normal text-gray-400">{stat.suffix}</span>
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <MatchRequestsPanel
          requests={matchRequests}
          onAccept={async (id) => {
            setMatchActionLoading(true);
            try {
              await acceptMatchRequest(id);
              const [stats, reqs] = await Promise.all([
                refreshMatches().then((r) => r.data),
                getMatchRequests().then((r) => r.data),
              ]);
              setMatchStats(stats);
              setMatchRequests(reqs);
            } finally {
              setMatchActionLoading(false);
            }
          }}
          onReject={async (id) => {
            setMatchActionLoading(true);
            try {
              await rejectMatchRequest(id);
              const reqs = await getMatchRequests();
              setMatchRequests(reqs.data);
            } finally {
              setMatchActionLoading(false);
            }
          }}
          loading={matchActionLoading}
        />

        {/* Match recommendations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="text-purple-600" size={22} />
              Recommended Skill Exchanges
            </h2>
            <Link
              to="/browse"
              className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {matchStats?.topMatches?.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {matchStats.topMatches.slice(0, 3).map((match) => (
                <MatchCard
                  key={match.user._id || match.user.name}
                  match={match}
                  loading={matchActionLoading}
                  onConnect={async (toUserId, msg) => {
                    setMatchActionLoading(true);
                    try {
                      await sendMatchRequest(toUserId, msg);
                      const stats = await refreshMatches();
                      setMatchStats(stats.data);
                    } finally {
                      setMatchActionLoading(false);
                    }
                  }}
                  onAccept={async (id) => {
                    setMatchActionLoading(true);
                    try {
                      await acceptMatchRequest(id);
                      const stats = await refreshMatches();
                      setMatchStats(stats.data);
                    } finally {
                      setMatchActionLoading(false);
                    }
                  }}
                  onReject={async (id) => {
                    setMatchActionLoading(true);
                    try {
                      await rejectMatchRequest(id);
                      const stats = await refreshMatches();
                      setMatchStats(stats.data);
                    } finally {
                      setMatchActionLoading(false);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center border border-dashed border-purple-200 dark:border-purple-800">
              <Users className="mx-auto text-purple-400 mb-3" size={40} />
              <p className="font-medium text-gray-900 dark:text-white">
                No exchange matches yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                Add skills you teach and want to learn. Another user with the opposite
                skills will appear here (e.g. you teach Design / learn JS, they teach JS /
                learn Design).
              </p>
              <Link
                to="/browse"
                className="inline-block mt-4 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold"
              >
                Find Matches
              </Link>
            </div>
          )}
        </div>

        {/* Alerts row */}
        {(pendingVerification > 0 || unreadMessages > 0 || (verificationStats?.pendingCount > 0) || (matchStats?.pendingReceived > 0)) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {matchStats?.pendingReceived > 0 && (
              <Link
                to="/browse"
                className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl hover:bg-purple-100/80 transition group"
              >
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                  <Users className="text-purple-600" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-purple-900 dark:text-purple-200">
                    {matchStats.pendingReceived} incoming exchange request{matchStats.pendingReceived > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-purple-700/80 dark:text-purple-300/80">
                    Review and accept mutual skill matches
                  </p>
                </div>
                <ChevronRight size={20} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
            {(verificationStats?.pendingCount > 0 || pendingVerification > 0) && (
              <Link
                to="/skill-verification"
                className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl hover:bg-amber-100/80 transition group"
              >
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Award className="text-amber-600" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    {verificationStats?.pendingCount ?? pendingVerification} skill{(verificationStats?.pendingCount ?? pendingVerification) > 1 ? "s" : ""} awaiting AI verification
                  </p>
                  <p className="text-sm text-amber-700/80 dark:text-amber-300/80">Take the Hugging Face powered quiz</p>
                </div>
                <ChevronRight size={20} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
            {unreadMessages > 0 && (
              <Link
                to="/messages"
                className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100/80 transition group"
              >
                <div className="p-3 bg-blue-100 rounded-xl">
                  <MessageCircle className="text-blue-600" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-blue-900">
                    {unreadMessages} unread message{unreadMessages > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-blue-700/80">Reply to keep conversations going</p>
                </div>
                <ChevronRight size={20} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick actions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <Link
                to="/profile"
                className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View profile <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {QUICK_ACTIONS.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    to={card.to}
                    className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:border-purple-100 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${card.bg} group-hover:scale-105 transition-transform`}>
                        <Icon size={22} className={card.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
                          {card.desc}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Open <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar panels */}
          <div className="space-y-6">
            {/* Progress card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-500" />
                Your Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">Verified skills</span>
                    <span className="font-semibold text-gray-900">
                      {verifiedCount}/{teachSkills.length || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          teachSkills.length
                            ? (verifiedCount / teachSkills.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Teaching hours</span>
                    <span className="font-medium text-gray-900">{profile?.teachingHours || 0}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Learning hours</span>
                    <span className="font-medium text-gray-900">{profile?.learningHours || 0}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Skills exchanged</span>
                    <span className="font-medium text-gray-900">{profile?.skillsExchanged || 0}</span>
                  </div>
                </div>
                <Link
                  to="/leaderboard"
                  className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition"
                >
                  <Trophy size={16} />
                  View Leaderboard
                </Link>
              </div>
            </div>

            {/* Upcoming sessions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={20} className="text-purple-500" />
                  Upcoming Sessions
                </h3>
                <Link to="/sessions" className="text-xs font-medium text-purple-600 hover:underline">
                  View all
                </Link>
              </div>
              {upcomingSessions.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingSessions.map((session, i) => (
                    <li
                      key={session._id || i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-purple-50/50 transition"
                    >
                      <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                        <Video size={16} className="text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock size={12} />
                          {formatSessionDate(session.date)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <Video className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-sm text-gray-500">No upcoming sessions</p>
                  <Link
                    to="/browse"
                    className="inline-block mt-2 text-sm font-medium text-purple-600 hover:underline"
                  >
                    Find a learning partner
                  </Link>
                </div>
              )}
            </div>

            {/* Recent messages */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MessageCircle size={20} className="text-blue-500" />
                  Recent Messages
                </h3>
                <Link to="/messages" className="text-xs font-medium text-purple-600 hover:underline">
                  View all
                </Link>
              </div>
              {recentMessages.length > 0 ? (
                <ul className="space-y-2">
                  {recentMessages.map((msg, i) => (
                    <li
                      key={msg._id || i}
                      className={`p-3 rounded-xl text-sm ${
                        msg.read ? "bg-gray-50" : "bg-blue-50 border border-blue-100"
                      }`}
                    >
                      <p className="font-medium text-gray-900 truncate">{msg.from}</p>
                      <p className="text-gray-500 truncate text-xs mt-0.5">{msg.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <MessageCircle className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-sm text-gray-500">No messages yet</p>
                  <Link
                    to="/browse"
                    className="inline-block mt-2 text-sm font-medium text-purple-600 hover:underline"
                  >
                    Start connecting
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
