"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

export interface ActionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  variant?: "danger" | "success" | "info" | "warning";
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const ActionPopup: React.FC<ActionPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon,
  variant = "info",
  isLoading = false,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const variantStyles = {
    danger: {
      border: "border-rose-500/30",
      glow: "shadow-[0_20px_60px_-15px_rgba(244,63,94,0.3)]",
      iconBg: "bg-rose-500/15 text-rose-400 border border-rose-500/20",
      button:
        "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-900/40",
    },
    success: {
      border: "border-emerald-500/30",
      glow: "shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)]",
      iconBg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
      button:
        "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/40",
    },
    warning: {
      border: "border-amber-500/30",
      glow: "shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3)]",
      iconBg: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
      button:
        "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-semibold shadow-amber-900/40",
    },
    info: {
      border: "border-cyan-500/30",
      glow: "shadow-[0_20px_60px_-15px_rgba(0,229,255,0.25)]",
      iconBg: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
      button:
        "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold shadow-cyan-900/40",
    },
  }[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isLoading && onClose()}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={`relative w-full max-w-lg bg-[#0c1220] border ${variantStyles.border} ${variantStyles.glow} rounded-2xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden text-left`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors disabled:opacity-30"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            {/* Header with Icon */}
            <div className="flex items-start gap-4">
              {icon && (
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${variantStyles.iconBg}`}
                >
                  {icon}
                </div>
              )}

              <div className="flex-1 pr-6">
                <h3 className="text-lg font-semibold text-white tracking-tight">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Custom Content / Form fields */}
            {children && <div className="mt-5">{children}</div>}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-40"
              >
                {cancelText}
              </button>

              {onConfirm && (
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles.button}`}
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  <span>{confirmText}</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
