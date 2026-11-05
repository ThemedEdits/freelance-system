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
    <div className={`relative w-full text-left pt-2.5 ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-between h-[46px] w-full px-3.5 rounded-xl border text-sm transition-colors outline-none ${
          isOpen
            ? "bg-black border-white ring-1 ring-white text-white"
            : "bg-black border-white/15 hover:border-white/30 text-white"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {label && (
          <span className="absolute -top-2.5 left-3 text-[11px] font-medium bg-black px-1.5 text-zinc-400 select-none pointer-events-none">
            {label}
          </span>
        )}

        <div className="flex items-center gap-2.5 overflow-hidden truncate">
          {icon && <span className="text-zinc-400 shrink-0">{icon}</span>}
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.icon}
              <span className="font-medium text-white truncate">{selectedOption.label}</span>
            </div>
          ) : (
            <span className="text-zinc-500">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          size={15}
          className={`text-zinc-400 transition-transform duration-150 shrink-0 ${
            isOpen ? "transform rotate-180 text-white" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 w-full mt-1.5 py-1.5 bg-zinc-950 border border-white/15 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
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
                      ? "bg-white/10 text-white font-medium"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {option.icon && (
                      <span className={isSelected ? "text-white" : "text-zinc-400"}>
                        {option.icon}
                      </span>
                    )}
                    <div>
                      <div className="truncate text-xs font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-[11px] text-zinc-500 truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={14} className="text-white shrink-0 ml-2" />
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
