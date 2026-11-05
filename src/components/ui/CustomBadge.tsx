"use client";

import React from "react";
import {
  Palette,
  Globe,
  Code2,
  CheckCircle2,
  AlertCircle,
  Clock,
  PieChart,
  Calendar,
  Layers,
} from "lucide-react";

export type BadgeType =
  | "graphic_design"
  | "web_development"
  | "software_engineering"
  | "monthly"
  | "per_project"
  | "hybrid"
  | "paid"
  | "late_paid"
  | "unpaid"
  | "partial"
  | "overdue"
  | "in_progress"
  | "completed";

interface CustomBadgeProps {
  type: BadgeType;
  label?: string;
  size?: "sm" | "md";
  className?: string;
  extraInfo?: string;
}

export const CustomBadge: React.FC<CustomBadgeProps> = ({
  type,
  label,
  size = "md",
  className = "",
  extraInfo,
}) => {
  const config = {
    // Categories
    graphic_design: {
      text: label || "Graphic Design",
      icon: <Palette size={size === "sm" ? 11 : 13} />,
      styles:
        "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:border-cyan-500/50",
    },
    web_development: {
      text: label || "Web Development",
      icon: <Globe size={size === "sm" ? 11 : 13} />,
      styles:
        "bg-purple-500/10 text-purple-300 border-purple-500/30 hover:border-purple-500/50",
    },
    software_engineering: {
      text: label || "Software Engineering",
      icon: <Code2 size={size === "sm" ? 11 : 13} />,
      styles:
        "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50",
    },

    // Billing Types
    monthly: {
      text: label || "Monthly Retainer",
      icon: <Calendar size={size === "sm" ? 11 : 13} />,
      styles: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    },
    per_project: {
      text: label || "Per Project",
      icon: <Layers size={size === "sm" ? 11 : 13} />,
      styles: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    },
    hybrid: {
      text: label || "Hybrid",
      icon: <Layers size={size === "sm" ? 11 : 13} />,
      styles: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    },

    // Payment Statuses
    paid: {
      text: label || "Paid Complete",
      icon: <CheckCircle2 size={size === "sm" ? 11 : 13} />,
      styles:
        "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    },
    late_paid: {
      text: label || "Late Paid",
      icon: <Clock size={size === "sm" ? 11 : 13} />,
      styles:
        "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
    },
    unpaid: {
      text: label || "Unpaid / Due",
      icon: <AlertCircle size={size === "sm" ? 11 : 13} />,
      styles:
        "bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
    },
    partial: {
      text: label || "Paid Partial",
      icon: <PieChart size={size === "sm" ? 11 : 13} />,
      styles:
        "bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.15)]",
    },
    overdue: {
      text: label || "Overdue",
      icon: <AlertCircle size={size === "sm" ? 11 : 13} />,
      styles:
        "bg-rose-600/20 text-rose-300 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.25)] animate-pulse",
    },

    // Project Statuses
    in_progress: {
      text: label || "In Progress",
      icon: <Clock size={size === "sm" ? 11 : 13} />,
      styles: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    },
    completed: {
      text: label || "Completed",
      icon: <CheckCircle2 size={size === "sm" ? 11 : 13} />,
      styles: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    },
  }[type] || {
    text: label || type,
    icon: null,
    styles: "bg-slate-800 text-slate-300 border-white/[0.1]",
  };

  const sizeClasses =
    size === "sm" ? "text-[11px] px-2 py-0.5 gap-1" : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors select-none ${sizeClasses} ${config.styles} ${className}`}
    >
      {config.icon}
      <span>{config.text}</span>
      {extraInfo && (
        <span className="text-[10px] opacity-75 font-normal pl-0.5">
          ({extraInfo})
        </span>
      )}
    </span>
  );
};
