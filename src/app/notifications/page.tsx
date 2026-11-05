"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  Calendar,
  Clock,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  CreditCard,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppNotification } from "@/lib/types";
import { formatDate } from "@/lib/billing";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = notifications.filter((n) =>
    filter === "unread" ? n.is_read === 0 : true
  );

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      <Header
        title="Notifications & Reset Alerts"
        subtitle="Real-time alerts for monthly cycle resets, due payments, and invoice reminders"
      />

      {/* Top Filter and Mark All Read bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Alerts ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "unread"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <CheckCheck size={15} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} />}
          title="No alerts right now"
          description="You're all caught up! When a client's monthly cycle resets or payments become overdue, notifications will appear here automatically."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isCycleReset = item.type === "cycle_reset";
            const isLate = item.type === "payment_late";

            return (
              <div
                key={item.id}
                onClick={() => item.is_read === 0 && handleMarkSingleRead(item.id)}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer ${
                  item.is_read === 0
                    ? "bg-[#0f172a]/90 border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.08)]"
                    : "glass-card border-white/[0.06] opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isLate
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        : isCycleReset
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                        : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                    }`}
                  >
                    {isLate ? (
                      <Clock size={18} />
                    ) : isCycleReset ? (
                      <Calendar size={18} />
                    ) : (
                      <AlertCircle size={18} />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      {item.is_read === 0 && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                      {item.message}
                    </p>
                    <span className="text-[11px] text-slate-500 block pt-0.5">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                  {item.link && (
                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-white/[0.08] transition-all"
                    >
                      <span>Take Action</span>
                      <ChevronRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
