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
  maxWidthClass?: string;
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
  maxWidthClass = "max-w-xl",
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  const confirmBtnStyle =
    variant === "danger"
      ? "bg-rose-600 hover:bg-rose-500 text-white"
      : "bg-white text-black hover:bg-zinc-200 font-semibold";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !isLoading && onClose()}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          />

          {/* Centering wrapper */}
          <div className="flex min-h-full items-center justify-center p-3 sm:p-6 py-8 text-center">
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`relative w-full ${maxWidthClass} max-h-[90vh] flex flex-col bg-black border border-white/15 rounded-2xl shadow-2xl z-10 text-left overflow-hidden`}
            >
              {/* Top Header Bar */}
              <div className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-4 border-b border-white/10 bg-black shrink-0">
                <div className="flex items-start gap-3 pr-6">
                  {icon && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-white/5 border border-white/10 text-white">
                      {icon}
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {title}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 shrink-0"
                  aria-label="Close dialog"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Scrollable Body Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {children}
              </div>

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-white/10 bg-black shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-40"
                >
                  {cancelText}
                </button>

                {onConfirm && (
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${confirmBtnStyle}`}
                  >
                    {isLoading && <Loader2 size={14} className="animate-spin" />}
                    <span>{confirmText}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
