import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { getVerifications } from "../../services/adminService";

export default function AdminVerifications() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ verifications: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getVerifications({ status, page, limit: 15 })
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  return (
    <AdminLayout
      title="Skill Verifications"
      subtitle="AI-graded skill verification attempts across the platform."
      actions={
        <select
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          className="px-3 py-2.5 rounded-xl border border-[#e5e7eb] bg-white text-sm text-[#374151] outline-none focus:border-[#2563eb]"
        >
          <option value="">All Results</option>
          <option value="PASSED">Passed</option>
          <option value="FAILED">Failed</option>
        </select>
      }
    >
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-left text-[#64748b]">
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-5 py-3.5 font-semibold">Skill</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Score</th>
                <th className="px-5 py-3.5 font-semibold">Result</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-[#94a3b8]">Loading…</td></tr>
              ) : data.verifications.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-[#94a3b8]">No verification attempts yet.</td></tr>
              ) : (
                data.verifications.map((v) => (
                  <tr key={v._id} className="hover:bg-[#f8fafc] transition">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[#0f172a]">{v.user}</div>
                      <div className="text-xs text-[#94a3b8]">{v.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[#475569] font-medium">{v.skillName}</td>
                    <td className="px-5 py-3.5 text-[#64748b]">{v.category}</td>
                    <td className="px-5 py-3.5 text-[#475569]">
                      {v.score}% <span className="text-xs text-[#94a3b8]">({v.correctAnswers}/{v.totalQuestions})</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        v.status === "PASSED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#94a3b8]">{fmt(v.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#f1f5f9] text-sm text-[#64748b]">
          <span>{data.total} attempts</span>
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
