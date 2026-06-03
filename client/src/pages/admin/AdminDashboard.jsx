import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  ShieldCheck,
  GraduationCap,
  TrendingUp,
  UserCheck,
  Ban,
  PauseCircle,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { getAdminStats } from "../../services/adminService";

function StatCard({ icon: Icon, label, value, sub, accent = "blue", onClick }) {
  const accents = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-violet-50 text-violet-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm transition hover:shadow-md ${
        onClick ? "cursor-pointer hover:-translate-y-0.5" : "cursor-default"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#64748b]">{label}</p>
          <p className="text-4xl font-bold text-[#0f172a] mt-2">{value}</p>
          {sub && <p className="text-xs text-[#94a3b8] mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accents[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
}

function Donut({ percent, label }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#10b981"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[#0f172a]">{percent}%</span>
        <span className="text-xs text-[#64748b]">{label}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => setStats(data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load stats")
      )
      .finally(() => setLoading(false));
  }, []);

  const maxTrend = Math.max(1, ...(stats?.signupTrend || []).map((d) => d.count));

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Monitor platform activity, user behavior, and system status at a glance."
    >
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-[#e5e7eb] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard
              icon={Users}
              label="Total Registered Users"
              value={stats.users.total}
              sub={`${stats.users.teachers} teachers · ${stats.users.learners} learners`}
              accent="blue"
              onClick={() => navigate("/admin/users")}
            />
            <StatCard
              icon={Calendar}
              label="Sessions Today"
              value={stats.sessions.today}
              sub={`${stats.sessions.active} active · ${stats.sessions.completed} completed`}
              accent="purple"
              onClick={() => navigate("/admin/sessions")}
            />
            <StatCard
              icon={ShieldCheck}
              label="Pending Skill Verifications"
              value={stats.verifications.pending}
              sub={`${stats.verifications.total} total attempts`}
              accent="amber"
              onClick={() => navigate("/admin/verifications")}
            />
            <StatCard
              icon={UserCheck}
              label="Active Accounts"
              value={stats.users.active}
              accent="green"
            />
            <StatCard
              icon={PauseCircle}
              label="Suspended"
              value={stats.users.suspended}
              accent="amber"
              onClick={() => navigate("/admin/users?status=suspended")}
            />
            <StatCard
              icon={Ban}
              label="Banned"
              value={stats.users.banned}
              accent="red"
              onClick={() => navigate("/admin/users?status=banned")}
            />
          </div>

          {/* Lower row: status + signup trend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-[#64748b] self-start mb-2">
                Verification Pass Rate
              </p>
              <Donut percent={stats.verifications.passRate} label="passed" />
              <p className="text-xs text-[#94a3b8] mt-3">
                {stats.verifications.passed} of {stats.verifications.total} passed
              </p>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-[#2563eb]" />
                <p className="text-sm font-medium text-[#0f172a]">
                  New Signups (last 7 days)
                </p>
              </div>
              {stats.signupTrend.length === 0 ? (
                <p className="text-sm text-[#94a3b8] py-10 text-center">
                  No recent signups recorded yet.
                </p>
              ) : (
                <div className="flex items-end justify-between gap-3 h-40">
                  {stats.signupTrend.map((d) => (
                    <div key={d._id} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-semibold text-[#475569]">
                        {d.count}
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-[#2563eb] to-[#60a5fa] rounded-t-md transition-all"
                        style={{ height: `${(d.count / maxTrend) * 100}%`, minHeight: "6px" }}
                      />
                      <span className="text-[10px] text-[#94a3b8]">
                        {d._id.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
