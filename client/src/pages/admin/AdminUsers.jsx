import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from "../../services/adminService";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspended: "bg-amber-50 text-amber-700 border-amber-200",
  banned: "bg-red-50 text-red-700 border-red-200",
};

const ROLE_STYLES = {
  admin: "bg-violet-50 text-violet-700",
  teacher: "bg-blue-50 text-blue-700",
  learner: "bg-slate-100 text-slate-700",
};

function Badge({ children, className }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${className}`}>
      {children}
    </span>
  );
}

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ users: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    getUsers({ search, role, status, page, limit: 15 })
      .then(({ data }) => setData(data))
      .catch((err) => setMsg(err.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, [search, role, status, page]);

  // Debounce search; immediate for filters/page
  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const changeStatus = async (id, accountStatus) => {
    setBusyId(id);
    setMsg("");
    try {
      await updateUserStatus(id, accountStatus);
      setMsg(`User ${accountStatus}.`);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const changeRole = async (id, newRole) => {
    setBusyId(id);
    try {
      await updateUserRole(id, newRole);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      await deleteUser(id);
      setMsg("User deleted.");
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const onFilter = (setter) => (e) => {
    setPage(1);
    setter(e.target.value);
    if (setter === setStatus) {
      const next = new URLSearchParams(searchParams);
      e.target.value ? next.set("status", e.target.value) : next.delete("status");
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <AdminLayout
      title="User Management"
      subtitle="View and manage platform users."
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search by name or email"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e5e7eb] bg-white text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={role}
          onChange={onFilter(setRole)}
          className="px-3 py-2.5 rounded-xl border border-[#e5e7eb] bg-white text-sm text-[#374151] outline-none focus:border-[#2563eb]"
        >
          <option value="">All Roles</option>
          <option value="learner">Learner</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={status}
          onChange={onFilter(setStatus)}
          className="px-3 py-2.5 rounded-xl border border-[#e5e7eb] bg-white text-sm text-[#374151] outline-none focus:border-[#2563eb]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {msg && (
        <div className="mb-4 text-sm text-[#2563eb] bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
          {msg}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-left text-[#64748b]">
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold">Skills</th>
                <th className="px-5 py-3.5 font-semibold">Account</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[#94a3b8]">Loading…</td></tr>
              ) : data.users.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[#94a3b8]">No users found.</td></tr>
              ) : (
                data.users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#f8fafc] transition">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[#0f172a]">{u.name}</div>
                      <div className="text-xs text-[#94a3b8]">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={u.role}
                        disabled={busyId === u._id}
                        onChange={(e) => changeRole(u._id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer outline-none ${ROLE_STYLES[u.role] || ""}`}
                      >
                        <option value="learner">Learner</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-[#475569]">
                      <span className="font-medium text-emerald-600">{u.verifiedSkills}</span>
                      <span className="text-[#94a3b8]"> / {u.totalSkills} verified</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={STATUS_STYLES[u.accountStatus]}>
                        {u.accountStatus}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {u.accountStatus !== "active" && (
                          <button
                            disabled={busyId === u._id}
                            onClick={() => changeStatus(u._id, "active")}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer disabled:opacity-50"
                          >
                            Activate
                          </button>
                        )}
                        {u.accountStatus !== "suspended" && (
                          <button
                            disabled={busyId === u._id}
                            onClick={() => changeStatus(u._id, "suspended")}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-0 cursor-pointer disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                        {u.accountStatus !== "banned" && (
                          <button
                            disabled={busyId === u._id}
                            onClick={() => changeStatus(u._id, "banned")}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white border-0 cursor-pointer disabled:opacity-50"
                          >
                            Ban
                          </button>
                        )}
                        <button
                          disabled={busyId === u._id}
                          onClick={() => removeUser(u._id, u.name)}
                          title="Delete user"
                          className="p-1.5 rounded-lg text-[#94a3b8] hover:text-red-600 hover:bg-red-50 border-0 bg-transparent cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#f1f5f9] text-sm text-[#64748b]">
          <span>{data.total} users</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-[#e5e7eb] bg-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page} of {data.totalPages}</span>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-[#e5e7eb] bg-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
