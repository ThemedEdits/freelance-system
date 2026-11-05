"use client";

import React, { useState } from "react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefixText?: string;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  defaultValue,
  prefixText,
  icon,
  error,
  hint,
  id,
  className = "",
  onFocus,
  onBlur,
  onChange,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? "");

  const hasValue = Boolean(internalValue || value || (props.type === "date" && internalValue));
  const isFloating = isFocused || hasValue || props.type === "date" || props.type === "time";
  const inputId = id || `float-input-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  return (
    <div className="relative w-full text-left">
      <div
        className={`relative flex items-center w-full rounded-xl transition-all duration-300 ${
          isFocused
            ? "bg-slate-900/90 border-cyan-500/70 shadow-[0_0_20px_rgba(0,229,255,0.18)]"
            : error
            ? "bg-rose-950/20 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
            : "bg-slate-900/50 border-white/[0.08] hover:border-white/[0.18] hover:bg-slate-900/70"
        } border`}
      >
        {icon && (
          <div className="pl-3.5 pr-1 text-slate-400 flex items-center justify-center">
            {icon}
          </div>
        )}

        {prefixText && isFloating && (
          <span className="pl-3.5 text-sm font-medium text-cyan-400 select-none">
            {prefixText}
          </span>
        )}

        <div className="relative flex-1 w-full">
          <input
            id={inputId}
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
            className={`w-full bg-transparent text-white px-3.5 pt-6 pb-2 text-sm focus:outline-none placeholder-transparent ${className}`}
            placeholder={label}
            {...props}
          />

          <label
            htmlFor={inputId}
            className={`absolute left-3.5 select-none pointer-events-none transition-all duration-200 ease-out origin-top-left ${
              isFloating
                ? "top-1.5 text-[11px] font-semibold tracking-wider uppercase text-cyan-400 scale-90"
                : "top-4 text-sm font-normal text-slate-400"
            }`}
          >
            {label}
          </label>
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-rose-400 font-medium pl-1 flex items-center gap-1">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-500 pl-1">{hint}</p>
      )}
    </div>
  );
};
