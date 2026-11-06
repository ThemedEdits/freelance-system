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
      className={`flex flex-col items-center justify-center p-10 sm:p-14 text-center rounded-xl bg-zinc-950 border border-dashed border-white/10 ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 mb-3.5">
        {icon || <FolderX size={22} />}
      </div>

      <h3 className="text-sm font-semibold text-white tracking-tight">
        {title}
      </h3>
      <p className="mt-1 text-xs text-zinc-400 max-w-sm leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm"
        >
          <Plus size={14} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
