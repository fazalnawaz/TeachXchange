import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons/EyeIcon";

export default function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  labelRight,
  showPasswordToggle = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType =
    isPassword && showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div className="mb-5">
      {(label || labelRight) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label
              htmlFor={name}
              className="block text-sm font-semibold text-[#111827]"
            >
              {label}
            </label>
          )}
          {labelRight}
        </div>
      )}

      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-lg border-0 bg-[#f3f4f6] px-4 py-3 text-[#111827] text-sm placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40"
        />
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </div>
  );
}
