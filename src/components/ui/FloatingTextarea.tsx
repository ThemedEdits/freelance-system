"use client";

import React, { useState } from "react";

interface FloatingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FloatingTextarea: React.FC<FloatingTextareaProps> = ({
  label,
  value,
  defaultValue,
  error,
  hint,
  id,
  rows = 3,
  className = "",
  onFocus,
  onBlur,
  onChange,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? "");

  const hasValue = Boolean(internalValue || value);
  const isFloating = isFocused || hasValue;
  const textareaId = id || `float-ta-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  return (
    <div className="relative w-full text-left">
      <div
        className={`relative w-full rounded-xl transition-all duration-300 ${
          isFocused
            ? "bg-slate-900/90 border-cyan-500/70 shadow-[0_0_20px_rgba(0,229,255,0.18)]"
            : error
            ? "bg-rose-950/20 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
            : "bg-slate-900/50 border-white/[0.08] hover:border-white/[0.18] hover:bg-slate-900/70"
        } border`}
      >
        <label
          htmlFor={textareaId}
          className={`absolute left-3.5 select-none pointer-events-none transition-all duration-200 ease-out origin-top-left ${
            isFloating
              ? "top-2 text-[11px] font-semibold tracking-wider uppercase text-cyan-400 scale-90"
              : "top-3.5 text-sm font-normal text-slate-400"
          }`}
        >
          {label}
        </label>

        <textarea
          id={textareaId}
          rows={rows}
          value={value !== undefined ? value : internalValue}
          onChange={handleChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={`w-full bg-transparent text-white px-3.5 pt-7 pb-2.5 text-sm focus:outline-none resize-none placeholder-transparent ${className}`}
          placeholder={label}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-rose-400 font-medium pl-1">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-500 pl-1">{hint}</p>
      )}
    </div>
  );
};
