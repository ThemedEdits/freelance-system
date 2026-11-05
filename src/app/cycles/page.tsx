"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Clock,
  PieChart,
  Calendar,
  Search,
  Filter,
  FilePlus,
  RefreshCw,
  ChevronRight,
  ShieldAlert,
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
    totalAmount: number;
    currentStatus: PaymentStatus;
    currentPaidAmount: number;
    dueDate?: string;
  }>({
    isOpen: false,
    entityType: "cycle",
    entityId: "",
    title: "",
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
    <div className="space-y-6 animate-fadeIn pb-12">
      <Header
        title="Monthly Retainer Cycles"
        subtitle="Track custom reset dates (e.g. 1st, 6th, 18th, 21st), calculate days late, and log payment receipts"
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/[0.08]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Retainer Volume
          </span>
          <span className="text-2xl font-bold text-white">
            {formatPKR(totalRetainerValue)}
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            Across {cycles.length} recorded cycle periods
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/[0.08]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Settled / Paid
          </span>
          <span className="text-2xl font-bold text-emerald-400">
            {formatPKR(totalPaid)}
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            Received via Bank / EasyPaisa
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/[0.08]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Pending / Due Retainers
          </span>
          <span className="text-2xl font-bold text-rose-400">
            {formatPKR(totalDue)}
          </span>
          <span className="text-xs text-rose-400 font-medium block mt-1">
            {overdueCount > 0 ? `${overdueCount} cycle(s) overdue` : "Awaiting payment"}
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/[0.08]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Cycle Reset Engine
          </span>
          <span className="text-sm font-bold text-cyan-300 block">
            Auto-Sync & Notifications
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            Notifies automatically upon cycle reset
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/[0.08]">
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === st.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search cycle, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/[0.08] focus:border-cyan-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
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
          icon={<CalendarClock size={32} />}
          title="No billing cycles match filter"
          description="Monthly client cycles are synchronized automatically based on each client's specific reset day (e.g. 1st, 6th, 18th, 21st)."
        />
      ) : (
        <div className="space-y-3">
          {filteredCycles.map((cycle) => {
            const isLate = cycle.payment_status === "late_paid";
            const isUnpaid = cycle.payment_status === "unpaid";
            const isOverdue =
              isUnpaid && new Date(cycle.due_date) < new Date();

            return (
              <div
                key={cycle.id}
                className="p-5 rounded-2xl glass-card border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                      href={`/clients/${cycle.client_id}`}
                      className="font-bold text-base text-white hover:text-cyan-300 transition-colors"
                    >
                      {cycle.client_business || cycle.client_name}
                    </Link>

                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.04] text-cyan-300 border border-white/[0.08] font-semibold">
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

                  <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <Calendar size={13} className="text-cyan-400" />
                      {formatDate(cycle.period_start)} — {formatDate(cycle.period_end)}
                    </span>
                    <span>•</span>
                    <span>Due: <strong>{formatDate(cycle.due_date)}</strong></span>
                    {cycle.paid_at && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400">
                          Paid on {formatDate(cycle.paid_at)}
                        </span>
                      </>
                    )}
                    {cycle.days_late > 0 && (
                      <span className="text-amber-400 font-semibold">
                        ({cycle.days_late} days after reset/due)
                      </span>
                    )}
                  </div>

                  {cycle.notes && (
                    <p className="text-xs text-slate-400 pt-0.5">{cycle.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-white block">
                      {formatPKR(cycle.amount)}
                    </span>
                    {cycle.payment_status === "partial" && (
                      <span className="text-xs text-indigo-400 block">
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
                          title: `${cycle.client_business || cycle.client_name} (${formatDate(cycle.period_start)})`,
                          totalAmount: cycle.amount,
                          currentStatus: cycle.payment_status,
                          currentPaidAmount: cycle.paid_amount,
                          dueDate: cycle.due_date,
                        })
                      }
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-white/[0.08] transition-all"
                    >
                      Update Status
                    </button>

                    <Link
                      href={`/invoices/new?client_id=${cycle.client_id}&cycle_id=${cycle.id}`}
                      className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-colors"
                      title="Generate Invoice for Cycle"
                    >
                      <FilePlus size={16} />
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
        totalAmount={paymentModalData.totalAmount}
        currentStatus={paymentModalData.currentStatus}
        currentPaidAmount={paymentModalData.currentPaidAmount}
        dueDate={paymentModalData.dueDate}
      />
    </div>
  );
}
