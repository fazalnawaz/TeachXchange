import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Calendar,
  GraduationCap,
  LogOut,
} from "lucide-react";

const TABS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
  { to: "/admin/sessions", label: "Sessions", icon: Calendar },
];

export default function AdminLayout({ children, title, subtitle, actions }) {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("userName") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Top blue bar */}
      <header className="bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7" />
            <span className="text-lg font-bold tracking-tight">TeachXchange</span>
            <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-blue-100">
              {adminName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium bg-white/15 hover:bg-white/25 transition px-3 py-1.5 rounded-lg border-0 text-white cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 overflow-x-auto">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap no-underline ${
                  isActive
                    ? "border-[#2563eb] text-[#2563eb]"
                    : "border-transparent text-[#6b7280] hover:text-[#111827]"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {(title || actions) && (
          <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
            <div>
              {title && (
                <h1 className="text-3xl font-bold text-[#0f172a]">{title}</h1>
              )}
              {subtitle && (
                <p className="text-[#64748b] mt-1 text-sm">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
