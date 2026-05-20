import { Link } from "react-router-dom";
import GraduationCapIcon from "./icons/GraduationCapIcon";

export default function Logo({ to = "/", className = "" }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 text-[#111827] font-bold text-xl no-underline ${className}`}
    >
      <GraduationCapIcon className="w-8 h-8 text-[#2563eb]" />
      <span>TeachXchange</span>
    </Link>
  );
}
