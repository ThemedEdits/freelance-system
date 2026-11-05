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
    <div className={`text-left pt-2.5 ${className}`}>
      <div className="relative flex items-center h-[46px] rounded-xl bg-black border border-white/15 hover:border-white/30 px-2 transition-colors">
        {label && (
          <span className="absolute -top-2.5 left-3 text-[11px] font-medium bg-black px-1.5 text-zinc-400 select-none pointer-events-none">
            {label}
          </span>
        )}

        <button
          type="button"
          disabled={disabled || value <= min}
          onClick={handleDecrement}
          aria-label="Decrease"
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus size={13} />
        </button>

        <div className="flex-1 flex items-center justify-center px-1">
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
            <span className="text-xs text-zinc-400 ml-1 select-none">{suffix}</span>
          )}
        </div>

        <button
          type="button"
          disabled={disabled || value >= max}
          onClick={handleIncrement}
          aria-label="Increase"
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
};
