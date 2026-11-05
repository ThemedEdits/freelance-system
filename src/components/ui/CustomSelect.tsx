"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full text-left ${className}`} ref={dropdownRef}>
      {label && (
        <span className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-between w-full px-3.5 py-3 rounded-xl border text-sm transition-all duration-200 outline-none ${
          isOpen
            ? "bg-slate-900/90 border-cyan-500/70 shadow-[0_0_20px_rgba(0,229,255,0.18)] text-white"
            : "bg-slate-900/50 border-white/[0.08] hover:border-white/[0.18] hover:bg-slate-900/70 text-slate-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden truncate">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.icon}
              <span className="font-medium text-white truncate">{selectedOption.label}</span>
            </div>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "transform rotate-180 text-cyan-400" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 py-1.5 bg-[#0e1626] border border-white/[0.12] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl max-h-60 overflow-y-auto"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-3.5 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-cyan-500/15 text-cyan-300 font-medium"
                      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {option.icon && (
                      <span className={isSelected ? "text-cyan-400" : "text-slate-400"}>
                        {option.icon}
                      </span>
                    )}
                    <div>
                      <div className="truncate">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-slate-500 truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={16} className="text-cyan-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
