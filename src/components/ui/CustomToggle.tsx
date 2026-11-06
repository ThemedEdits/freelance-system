"use client";

import React from "react";

interface CustomToggleProps {
  label?: string;
  sublabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const CustomToggle: React.FC<CustomToggleProps> = ({
  label,
  sublabel,
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center justify-between gap-4 select-none cursor-pointer p-3 rounded-xl transition-colors duration-150 border ${
        checked
          ? "bg-zinc-900 border-white/20"
          : "bg-black/60 border-white/10 hover:border-white/20"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {(label || sublabel) && (
        <div className="flex flex-col text-left pr-2">
          {label && (
            <span className="text-sm font-medium text-white">{label}</span>
          )}
          {sublabel && (
            <span className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{sublabel}</span>
          )}
        </div>
      )}

      {/* Perfectly centered slider & sticky smooth knob */}
      <div
        className={`relative inline-flex items-center h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 ease-in-out px-[2px] ${
          checked
            ? "bg-white border-white"
            : "bg-zinc-800 border-zinc-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-[18px] w-[18px] rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
            checked
              ? "translate-x-[20px] bg-black"
              : "translate-x-0 bg-zinc-300"
          }`}
        />
      </div>
    </div>
  );
};
