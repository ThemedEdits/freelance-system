"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Calendar,
  Clock,
  ChevronRight,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { AppNotification } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const { showToast } = useToast();
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
      showToast({
        type: "success",
        title: "All Caught Up",
        message: "All notifications marked as read.",
      });
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
    <div className="space-y-6 pb-16">
      <Header
        title="Notifications & Reset Alerts"
        subtitle="Real-time alerts for monthly cycle resets, due payments, and invoice reminders"
      />

      {/* Top Filter and Mark All Read bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-zinc-950 border border-white/10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-white text-black font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            All Alerts ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "unread"
                ? "bg-white text-black font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <CheckCheck size={14} />
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
          icon={<Bell size={28} />}
          title="No alerts right now"
          description="You're all caught up! When a client's monthly cycle resets or payments become overdue, notifications will appear here automatically."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const isCycleReset = item.type === "cycle_reset";
            const isLate = item.type === "payment_late";

            return (
              <div
                key={item.id}
                onClick={() => item.is_read === 0 && handleMarkSingleRead(item.id)}
                className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer ${
                  item.is_read === 0
                    ? "bg-zinc-950 border-white/20"
                    : "bg-black border-white/5 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-900 border border-white/10 shrink-0 text-white">
                    {isLate ? (
                      <Clock size={16} />
                    ) : isCycleReset ? (
                      <Calendar size={16} />
                    ) : (
                      <CreditCard size={16} />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-white">
                        {item.title}
                      </h4>
                      {item.is_read === 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {item.message}
                    </p>

                    <span className="text-[10px] text-zinc-500 block pt-0.5">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>

                {(item.link || item.client_id) && (
                  <Link
                    href={item.link || `/clients/${item.client_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors shrink-0"
                  >
                    <span>View Details</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
