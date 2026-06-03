import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { getSessions } from "../../services/adminService";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function AdminSessions() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ sessions: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getSessions({ status, page, limit: 15 })
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  const fmt = (d) =>
    d ? new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <AdminLayout
      title="Learning Sessions"
      subtitle="Scheduled and completed peer learning sessions."
      actions={
        <select
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          className="px-3 py-2.5 rounded-xl border border-[#e5e7eb] bg-white text-sm text-[#374151] outline-none focus:border-[#2563eb]"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      }
    >
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-left text-[#64748b]">
                <th className="px-5 py-3.5 font-semibold">Session</th>
                <th className="px-5 py-3.5 font-semibold">Participants</th>
                <th className="px-5 py-3.5 font-semibold">Skills</th>
                <th className="px-5 py-3.5 font-semibold">Scheduled</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[#94a3b8]">Loading…</td></tr>
              ) : data.sessions.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[#94a3b8]">No sessions found.</td></tr>
              ) : (
                data.sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-[#f8fafc] transition">
                    <td className="px-5 py-3.5 font-medium text-[#0f172a]">{s.title}</td>
                    <td className="px-5 py-3.5 text-[#475569]">
                      {s.participants.join(" · ") || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-[#64748b] text-xs">
                      {[s.teachSkill, s.learnSkill].filter(Boolean).join(" ⇄ ") || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-[#94a3b8]">{fmt(s.scheduledAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[s.status] || ""}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#f1f5f9] text-sm text-[#64748b]">
          <span>{data.total} sessions</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg border border-[#e5e7eb] bg-white disabled:opacity-40 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
            <span>Page {page} of {data.totalPages}</span>
            <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg border border-[#e5e7eb] bg-white disabled:opacity-40 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
