"use client";

import React from "react";

export const LoadingSkeleton: React.FC<{
  className?: string;
  variant?: "card" | "text" | "circle" | "stat";
}> = ({ className = "", variant = "card" }) => {
  if (variant === "circle") {
    return (
      <div
        className={`rounded-full bg-white/[0.05] animate-pulse border border-white/[0.04] ${className}`}
      />
    );
  }

  if (variant === "text") {
    return (
      <div
        className={`h-4 rounded-md bg-white/[0.05] animate-pulse border border-white/[0.04] ${className}`}
      />
    );
  }

  if (variant === "stat") {
    return (
      <div className="p-6 rounded-2xl glass-card animate-pulse border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-white/[0.08] rounded" />
          <div className="h-8 w-8 rounded-xl bg-white/[0.06]" />
        </div>
        <div className="h-8 w-36 bg-white/[0.1] rounded mb-2" />
        <div className="h-3 w-48 bg-white/[0.05] rounded" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl glass-card p-6 animate-pulse border border-white/[0.06] ${className}`}
    >
      <div className="h-5 w-1/3 bg-white/[0.08] rounded mb-4" />
      <div className="h-4 w-full bg-white/[0.05] rounded mb-2.5" />
      <div className="h-4 w-4/5 bg-white/[0.05] rounded mb-2.5" />
      <div className="h-4 w-2/3 bg-white/[0.05] rounded" />
    </div>
  );
};
