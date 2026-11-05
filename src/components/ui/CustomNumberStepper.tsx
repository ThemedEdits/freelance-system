"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";

interface CustomNumberStepperProps {
  label?: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  suffix?: string;
}

export const CustomNumberStepper: React.FC<CustomNumberStepperProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 9999,
  step = 1,
  disabled = false,
  className = "",
  suffix,
}) => {
  const handleDecrement = () => {
    if (!disabled && value > min) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (!disabled && value < max) {
      onChange(Math.min(max, value + step));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onChange(Math.min(max, Math.max(min, val)));
    } else if (e.target.value === "") {
      onChange(min);
    }
  };

  return (
    <div className={`text-left ${className}`}>
      {label && (
        <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}

      <div className="flex items-center rounded-xl bg-slate-900/60 border border-white/[0.08] hover:border-white/[0.18] p-1 transition-all duration-200">
        <button
          type="button"
          disabled={disabled || value <= min}
          onClick={handleDecrement}
          aria-label="Decrease quantity"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 text-slate-300 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus size={14} />
        </button>

        <div className="flex-1 flex items-center justify-center px-2">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            disabled={disabled}
            onChange={handleInputChange}
            className="w-full text-center bg-transparent text-white font-semibold text-sm focus:outline-none"
          />
          {suffix && (
            <span className="text-xs text-slate-400 ml-1 select-none">{suffix}</span>
          )}
        </div>

        <button
          type="button"
          disabled={disabled || value >= max}
          onClick={handleIncrement}
          aria-label="Increase quantity"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 text-slate-300 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};
