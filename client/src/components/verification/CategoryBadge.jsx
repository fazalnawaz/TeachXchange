import {
  Code2,
  Languages,
  Palette,
  Briefcase,
  Brain,
  GraduationCap,
  Dumbbell,
  Sparkles,
} from "lucide-react";

const CATEGORY_CONFIG = {
  programming: {
    label: "Programming",
    icon: Code2,
    className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  language: {
    label: "Language",
    icon: Languages,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  design: {
    label: "Design",
    icon: Palette,
    className: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  },
  business: {
    label: "Business",
    icon: Briefcase,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  data_science: {
    label: "Data Science",
    icon: Brain,
    className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  },
  academic: {
    label: "Academic",
    icon: GraduationCap,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  health_fitness: {
    label: "Health & Fitness",
    icon: Dumbbell,
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  },
  music_arts: {
    label: "Music & Arts",
    icon: Sparkles,
    className: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
  general: {
    label: "General",
    icon: Sparkles,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
};

export default function CategoryBadge({ categoryId, categoryLabel, size = "md" }) {
  const config = CATEGORY_CONFIG[categoryId] || CATEGORY_CONFIG.general;
  const Icon = config.icon;
  const label = categoryLabel || config.label;
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl font-semibold ${config.className} ${sizeClass}`}
    >
      <Icon size={size === "sm" ? 12 : 14} />
      {label}
    </span>
  );
}
