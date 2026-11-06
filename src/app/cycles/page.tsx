"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Calendar,
  Search,
  FilePlus,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { PaymentStatusModal } from "@/components/common/PaymentStatusModal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { MonthlyCycle, PaymentStatus } from "@/lib/types";
import { formatPKR, formatDate } from "@/lib/utils";

export default function CyclesPage() {
  const [cycles, setCycles] = useState<MonthlyCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    entityType: "cycle" | "project";
    entityId: string;
    title: string;
    subtitle?: string;
    totalAmount: number;
    currentStatus: PaymentStatus;
    currentPaidAmount: number;
    dueDate?: string;
  }>({
    isOpen: false,
    entityType: "cycle",
    entityId: "",
    title: "",
    subtitle: undefined,
    totalAmount: 0,
    currentStatus: "unpaid",
    currentPaidAmount: 0,
  });

  const fetchCycles = async () => {
    setIsLoading(true);
    try {
      let url = "/api/cycles?";
      if (selectedStatus !== "all") {
        url += `status=${selectedStatus}&`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCycles(data.cycles || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, [selectedStatus]);

  const filteredCycles = cycles.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.client_name?.toLowerCase().includes(q) ||
      c.client_business?.toLowerCase().includes(q) ||
      c.period_start?.includes(q) ||
      c.period_end?.includes(q)
    );
  });

  // Financial summary
  const totalRetainerValue = cycles.reduce((acc, c) => acc + c.amount, 0);
  const totalPaid = cycles.reduce((acc, c) => acc + (c.paid_amount || 0), 0);
  const totalDue = Math.max(0, totalRetainerValue - totalPaid);
  const overdueCount = cycles.filter(
    (c) => c.payment_status === "unpaid" && new Date(c.due_date) < new Date()
  ).length;

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Monthly Retainer Cycles"
        subtitle="Track custom reset dates (e.g. 1st, 6th, 18th, 21st), calculate days late, and log payment receipts"
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-white/10">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Total Retainer Volume
          </span>
          <span className="text-xl sm:text-2xl font-bold text-white">
            {formatPKR(totalRetainerValue)}
          </span>
          <span className="text-xs text-zinc-400 block mt-1">
            Across {cycles.length} recorded cycle periods
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-white/10">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Total Settled / Paid
          </span>
          <span className="text-xl sm:text-2xl font-bold text-white">
            {formatPKR(totalPaid)}
          </span>
          <span className="text-xs text-zinc-400 block mt-1">
            Received via Bank / EasyPaisa
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-white/10">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Pending / Due Retainers
          </span>
          <span className="text-xl sm:text-2xl font-bold text-white">
            {formatPKR(totalDue)}
          </span>
          <span className="text-xs text-zinc-400 font-medium block mt-1">
            {overdueCount > 0 ? `${overdueCount} cycle(s) overdue` : "Awaiting payment"}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-white/10">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Cycle Reset Engine
          </span>
          <span className="text-sm font-bold text-white block">
            Auto-Sync & Notifications
          </span>
          <span className="text-xs text-zinc-400 block mt-1">
            Notifies automatically upon cycle reset
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-zinc-950 border border-white/10">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Statuses" },
            { id: "unpaid", label: "Unpaid / Due" },
            { id: "paid", label: "Paid Complete" },
            { id: "late_paid", label: "Late Paid" },
            { id: "partial", label: "Paid Partial" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedStatus === st.id
                  ? "bg-white text-black font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search cycle, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-white/10 focus:border-white/30 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Cycles Feed */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : filteredCycles.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={28} />}
          title="No billing cycles match filter"
          description="Monthly client cycles are synchronized automatically based on each client's specific reset day (e.g. 1st, 6th, 18th, 21st)."
        />
      ) : (
        <div className="space-y-3">
          {filteredCycles.map((cycle) => {
            const isUnpaid = cycle.payment_status === "unpaid";
            const isOverdue =
              isUnpaid && new Date(cycle.due_date) < new Date();

            return (
              <div
                key={cycle.id}
                className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-white/10 hover:border-white/20 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/clients/${cycle.client_id}`}
                      className="font-bold text-sm sm:text-base text-white hover:underline transition-colors"
                    >
                      {cycle.client_business || cycle.client_name}
                    </Link>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/10 font-medium">
                      Resets on {cycle.cycle_reset_day}th
                    </span>

                    <CustomBadge
                      type={isOverdue ? "overdue" : cycle.payment_status}
                      size="sm"
                      extraInfo={
                        cycle.days_late > 0 ? `${cycle.days_late}d late` : undefined
                      }
                    />
                  </div>

                  <div className="text-xs text-zinc-400 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-zinc-300">
                      <Calendar size={12} className="text-zinc-400" />
                      {formatDate(cycle.period_start)} — {formatDate(cycle.period_end)}
                    </span>
                    <span>•</span>
                    <span>Due: <strong>{formatDate(cycle.due_date)}</strong></span>
                    {cycle.paid_at && (
                      <>
                        <span>•</span>
                        <span className="text-white">
                          Paid on {formatDate(cycle.paid_at)}
                        </span>
                      </>
                    )}
                    {cycle.days_late > 0 && (
                      <span className="text-zinc-400">
                        ({cycle.days_late} days after reset/due)
                      </span>
                    )}
                  </div>

                  {cycle.notes && (
                    <p className="text-xs text-zinc-400 pt-0.5">{cycle.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-white/5 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-sm sm:text-base font-bold text-white block">
                      {formatPKR(cycle.amount)}
                    </span>
                    {cycle.payment_status === "partial" && (
                      <span className="text-xs text-zinc-400 block">
                        Received: {formatPKR(cycle.paid_amount)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentModalData({
                          isOpen: true,
                          entityType: "cycle",
                          entityId: cycle.id,
                          title: cycle.client_business || cycle.client_name || "Monthly Retainer",
                          subtitle: `${formatDate(cycle.period_start)} to ${formatDate(cycle.period_end)}`,
                          totalAmount: cycle.amount,
                          currentStatus: cycle.payment_status,
                          currentPaidAmount: cycle.paid_amount,
                          dueDate: cycle.due_date,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors"
                    >
                      Update
                    </button>

                    <Link
                      href={`/invoices/new?client_id=${cycle.client_id}&cycle_id=${cycle.id}`}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                      title="Generate Invoice for Cycle"
                    >
                      <FilePlus size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Status Modal */}
      <PaymentStatusModal
        isOpen={paymentModalData.isOpen}
        onClose={() =>
          setPaymentModalData((prev) => ({ ...prev, isOpen: false }))
        }
        onSuccess={fetchCycles}
        entityType={paymentModalData.entityType}
        entityId={paymentModalData.entityId}
        title={paymentModalData.title}
        subtitle={paymentModalData.subtitle}
        totalAmount={paymentModalData.totalAmount}
        currentStatus={paymentModalData.currentStatus}
        currentPaidAmount={paymentModalData.currentPaidAmount}
        dueDate={paymentModalData.dueDate}
      />
    </div>
  );
}
