"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Plus, FilePlus, Briefcase } from "lucide-react";
import { AppNotification } from "@/lib/types";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenNewClient?: () => void;
  onOpenNewProject?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenNewClient,
  onOpenNewProject,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(
            (data.notifications || []).filter(
              (n: AppNotification) => n.is_read === 0
            ).length
          );
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="relative w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-white/10">
      <div className="min-w-0 flex-1">
        {title && (
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
        {onOpenNewProject && (
          <button
            type="button"
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors"
          >
            <Briefcase size={14} className="text-zinc-400" />
            <span>New Project</span>
          </button>
        )}

        {onOpenNewClient && (
          <button
            type="button"
            onClick={onOpenNewClient}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add Client</span>
          </button>
        )}

        <Link
          href="/invoices/new"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors"
        >
          <FilePlus size={14} className="text-zinc-400" />
          <span>New Invoice</span>
        </Link>

        {/* Desktop notification bell */}
        <Link
          href="/notifications"
          aria-label="View notifications"
          className="relative hidden lg:flex p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
};
