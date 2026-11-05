"use client";

import React from "react";
import { motion } from "framer-motion";

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
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center justify-between gap-4 select-none cursor-pointer p-2.5 rounded-xl transition-all duration-200 hover:bg-white/[0.03] ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {(label || sublabel) && (
        <div className="flex flex-col text-left">
          {label && (
            <span className="text-sm font-medium text-slate-200">{label}</span>
          )}
          {sublabel && (
            <span className="text-xs text-slate-400 mt-0.5">{sublabel}</span>
          )}
        </div>
      )}

      <div
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out ${
          checked
            ? "bg-cyan-500/80 border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
            : "bg-slate-800/80 border-white/[0.1]"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          } mt-0.5`}
        />
      </div>
    </div>
  );
};
