"use client";

import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

interface CustomDatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  min?: string;
  max?: string;
  showQuickPicks?: boolean;
  className?: string;
  error?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  showQuickPicks = true,
  className = "",
  error,
}) => {
  const setQuickDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const ymd = d.toISOString().split("T")[0];
    onChange(ymd);
  };

  return (
    <div className={`relative w-full text-left pt-2.5 ${className}`}>
      <div className="relative flex items-center h-[46px] w-full rounded-xl bg-black border border-white/15 hover:border-white/30 focus-within:border-white focus-within:ring-1 focus-within:ring-white transition-colors">
        <label className="absolute -top-2.5 left-3 text-[11px] font-medium bg-black px-1.5 text-zinc-400 select-none pointer-events-none">
          {label}
        </label>

        <div className="pl-3.5 pr-2 text-zinc-400 select-none">
          <CalendarIcon size={15} />
        </div>

        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-white px-2 py-2 text-sm focus:outline-none [color-scheme:dark] cursor-pointer"
        />
      </div>

      {showQuickPicks && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[10px] uppercase font-semibold text-zinc-500 mr-1 select-none">
            Quick:
          </span>
          {[
            { label: "Today", days: 0 },
            { label: "+7d", days: 7 },
            { label: "+14d", days: 14 },
            { label: "+30d", days: 30 },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => setQuickDate(btn.days)}
              className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-rose-400 pl-1">{error}</p>}
    </div>
  );
};
