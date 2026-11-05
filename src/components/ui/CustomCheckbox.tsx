"use client";

import React from "react";
import { Check } from "lucide-react";

interface CustomCheckboxProps {
  label?: string | React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  return (
    <label
      className={`inline-flex items-center gap-3 select-none cursor-pointer group ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      onClick={(e) => {
        if (!disabled) {
          e.preventDefault();
          onChange(!checked);
        }
      }}
    >
      <div
        className={`relative flex items-center justify-center w-5 h-5 rounded-lg border transition-all duration-200 ${
          checked
            ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
            : "bg-slate-900/60 border-white/[0.15] group-hover:border-white/[0.3] text-transparent"
        }`}
      >
        <Check
          size={13}
          strokeWidth={3}
          className={`transition-transform duration-150 ${
            checked ? "scale-100" : "scale-0"
          }`}
        />
      </div>

      {label && (
        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
          {label}
        </span>
      )}
    </label>
  );
};
