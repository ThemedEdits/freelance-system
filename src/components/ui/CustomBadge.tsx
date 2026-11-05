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
      icon: <Palette size={size === "sm" ? 11 : 12} />,
      styles: "bg-zinc-900 text-zinc-300 border-white/15",
    },
    web_development: {
      text: label || "Web Development",
      icon: <Globe size={size === "sm" ? 11 : 12} />,
      styles: "bg-zinc-900 text-zinc-300 border-white/15",
    },
    software_engineering: {
      text: label || "Software Engineering",
      icon: <Code2 size={size === "sm" ? 11 : 12} />,
      styles: "bg-zinc-900 text-zinc-300 border-white/15",
    },

    // Billing Types
    monthly: {
      text: label || "Monthly Retainer",
      icon: <Calendar size={size === "sm" ? 11 : 12} />,
      styles: "bg-white/5 text-zinc-300 border-white/10",
    },
    per_project: {
      text: label || "Per Project",
      icon: <Layers size={size === "sm" ? 11 : 12} />,
      styles: "bg-white/5 text-zinc-300 border-white/10",
    },
    hybrid: {
      text: label || "Hybrid",
      icon: <Layers size={size === "sm" ? 11 : 12} />,
      styles: "bg-white/5 text-zinc-300 border-white/10",
    },

    // Payment Statuses
    paid: {
      text: label || "Paid",
      icon: <CheckCircle2 size={size === "sm" ? 11 : 12} />,
      styles: "bg-white text-black font-semibold border-white",
    },
    late_paid: {
      text: label || "Late Paid",
      icon: <Clock size={size === "sm" ? 11 : 12} />,
      styles: "bg-zinc-900 text-zinc-300 border-white/25",
    },
    unpaid: {
      text: label || "Unpaid",
      icon: <AlertCircle size={size === "sm" ? 11 : 12} />,
      styles: "bg-zinc-900 text-zinc-400 border-white/15",
    },
    partial: {
      text: label || "Partial",
      icon: <PieChart size={size === "sm" ? 11 : 12} />,
      styles: "bg-zinc-900 text-zinc-300 border-white/20",
    },
    overdue: {
      text: label || "Overdue",
      icon: <AlertCircle size={size === "sm" ? 11 : 12} />,
      styles: "bg-zinc-900 text-rose-300 border-rose-500/40",
    },

    in_progress: {
      text: label || "In Progress",
      icon: <Clock size={size === "sm" ? 11 : 12} />,
      styles: "bg-zinc-900 text-zinc-300 border-white/15",
    },
    completed: {
      text: label || "Completed",
      icon: <CheckCircle2 size={size === "sm" ? 11 : 12} />,
      styles: "bg-white text-black font-semibold border-white",
    },
  }[type] || {
    text: label || type,
    icon: null,
    styles: "bg-zinc-900 text-zinc-300 border-white/10",
  };

  const sizeClasses =
    size === "sm" ? "text-[11px] px-2 py-0.5 gap-1" : "text-xs px-2.5 py-0.5 gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border select-none ${sizeClasses} ${config.styles} ${className}`}
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
