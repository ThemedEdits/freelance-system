"use client";

import React from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

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
    <div className={`relative w-full text-left ${className}`}>
      <span className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>

      <div className="relative flex items-center w-full rounded-xl bg-slate-900/50 border border-white/[0.08] hover:border-white/[0.18] focus-within:border-cyan-500/70 focus-within:shadow-[0_0_20px_rgba(0,229,255,0.18)] transition-all duration-300">
        <div className="pl-3.5 pr-2 text-cyan-400 select-none">
          <CalendarIcon size={16} />
        </div>

        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-white px-2 py-3 text-sm focus:outline-none [color-scheme:dark] cursor-pointer"
        />
      </div>

      {showQuickPicks && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[10px] uppercase font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Clock size={11} /> Quick:
          </span>
          <button
            type="button"
            onClick={() => setQuickDate(0)}
            className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.06] transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(7)}
            className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.06] transition-colors"
          >
            +7 Days
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(14)}
            className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.06] transition-colors"
          >
            +14 Days
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(30)}
            className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.06] transition-colors"
          >
            +30 Days
          </button>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-rose-400 pl-1">{error}</p>}
    </div>
  );
};
