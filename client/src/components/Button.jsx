import { Link } from "react-router-dom";

const base =
  "inline-flex items-center justify-center font-semibold text-sm transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none";

const variants = {
  primary:
    "bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5",
  secondary:
    "bg-white text-[#111827] border border-[#e5e7eb] hover:bg-[#f9fafb] px-5 py-2.5",
  navLink:
    "bg-transparent text-[#374151] hover:text-[#111827] font-medium px-0 py-0",
  full:
    "w-full bg-[#2563eb] text-white hover:bg-[#1d4ed8] py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  to,
  href,
  type = "button",
  onClick,
  disabled,
}) {
  const classes = `${base} ${variants[variant] || variants.primary} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
