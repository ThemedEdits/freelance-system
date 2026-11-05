"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  FilePlus,
  Briefcase,
  Users,
  Search,
  Sparkles,
} from "lucide-react";
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
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
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#090d16]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div>
        {title ? (
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span className="text-cyan-400">Themed Edits</span>
            <span className="text-slate-600">•</span>
            <span>Workspace</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Action: New Project */}
        {onOpenNewProject && (
          <button
            type="button"
            onClick={onOpenNewProject}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.08] transition-all active:scale-95"
          >
            <Briefcase size={14} className="text-purple-400" />
            <span>New Project</span>
          </button>
        )}

        {/* Quick Action: Add Client */}
        {onOpenNewClient && (
          <button
            type="button"
            onClick={onOpenNewClient}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-950/50 transition-all active:scale-95"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Add Client</span>
          </button>
        )}

        {/* Invoice shortcut */}
        <Link
          href="/invoices/new"
          className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.08] transition-all"
        >
          <FilePlus size={14} className="text-cyan-400" />
          <span>New Invoice</span>
        </Link>

        {/* Notifications Icon with Badge */}
        <Link
          href="/notifications"
          aria-label="View notifications"
          className="relative p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-cyan-400 transition-all"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};
