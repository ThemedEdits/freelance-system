"use client";

import React from "react";
import { FolderX, Plus } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-card border border-dashed border-white/[0.12] ${className}`}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-cyan-400 mb-4 shadow-[0_0_25px_rgba(0,229,255,0.1)]">
        {icon || <FolderX size={26} />}
      </div>

      <h3 className="text-base font-semibold text-white tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-slate-400 max-w-sm leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold shadow-lg shadow-cyan-900/30 transition-all active:scale-95"
        >
          <Plus size={15} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
