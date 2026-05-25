import { Code2, Languages, Palette, Briefcase, Sparkles } from "lucide-react";

const SKILL_STYLES = {
  cpp: { label: "C++", icon: Code2, className: "bg-slate-800 text-slate-100" },
  java: { label: "Java", icon: Code2, className: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200" },
  python: { label: "Python", icon: Code2, className: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-200" },
  javascript: { label: "JavaScript", icon: Code2, className: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200" },
  react: { label: "React", icon: Code2, className: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-200" },
  german: { label: "German", icon: Languages, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" },
  english: { label: "English", icon: Languages, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200" },
  urdu: { label: "Urdu", icon: Languages, className: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200" },
  photoshop: { label: "Photoshop", icon: Palette, className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200" },
  ui_ux: { label: "UI/UX", icon: Palette, className: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200" },
  marketing: { label: "Marketing", icon: Briefcase, className: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200" },
};

export default function SkillBadge({ skillKey, skillName, size = "md" }) {
  const config = SKILL_STYLES[skillKey] || {
    label: skillName || "Skill",
    icon: Sparkles,
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
  };
  const Icon = config.icon;
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl font-bold ${config.className} ${sizeClass}`}
    >
      <Icon size={size === "sm" ? 12 : 14} />
      {skillName || config.label}
    </span>
  );
}
