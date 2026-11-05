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

  const hasValue = Boolean(
    (value !== undefined && value !== null && String(value).length > 0) ||
      (internalValue !== undefined && internalValue !== null && String(internalValue).length > 0)
  );
  const isFloating = isFocused || hasValue;
  const textareaId = id || `float-ta-${label.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  return (
    <div className="relative w-full text-left pt-2.5">
      <div
        className={`relative w-full rounded-xl transition-colors duration-150 ${
          isFocused
            ? "bg-black border-white ring-1 ring-white"
            : error
            ? "bg-black border-rose-500"
            : "bg-black border-white/15 hover:border-white/30"
        } border`}
      >
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
          className={`w-full bg-transparent text-white px-3.5 py-3 text-sm focus:outline-none resize-none placeholder-transparent ${className}`}
          placeholder={label}
          {...props}
        />

        {/* Google-style floating label across the border line */}
        <label
          htmlFor={textareaId}
          className={`absolute left-3 select-none pointer-events-none px-1.5 transition-all duration-150 ease-out z-10 ${
            isFloating
              ? "-top-2.5 text-[11px] font-medium tracking-tight bg-black text-white"
              : "top-3.5 text-xs font-normal text-zinc-400"
          } ${isFocused ? "text-white" : error ? "text-rose-400" : ""}`}
        >
          {label}
        </label>
      </div>

      {error && (
        <p className="mt-1 text-xs text-rose-400 font-medium pl-1">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-zinc-500 pl-1">{hint}</p>
      )}
    </div>
  );
};
