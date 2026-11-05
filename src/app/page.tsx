"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Users,
  Calendar,
  Clock,
  Plus,
  FilePlus,
  Briefcase,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Palette,
  Globe,
  Code2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { ClientModal } from "@/components/clients/ClientModal";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { PaymentStatusModal } from "@/components/common/PaymentStatusModal";
import { DashboardStats, MonthlyCycle, Project } from "@/lib/types";
import { formatPKR, formatDate } from "@/lib/billing";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCycles, setRecentCycles] = useState<MonthlyCycle[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    entityType: "cycle" | "project";
    entityId: string;
    title: string;
    totalAmount: number;
    currentStatus: any;
    currentPaidAmount: number;
  }>({
    isOpen: false,
    entityType: "cycle",
    entityId: "",
    title: "",
    totalAmount: 0,
    currentStatus: "unpaid",
    currentPaidAmount: 0,
  });

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, cyclesRes, projectsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/cycles?limit=6"),
        fetch("/api/projects?limit=5"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (cyclesRes.ok) {
        const data = await cyclesRes.json();
        setRecentCycles(data.cycles || []);
      }
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setRecentProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const openPaymentModal = (
    type: "cycle" | "project",
    id: string,
    title: string,
    total: number,
    status: any,
    paid: number
  ) => {
    setPaymentModalData({
      isOpen: true,
      entityType: type,
      entityId: id,
      title,
      totalAmount: total,
      currentStatus: status,
      currentPaidAmount: paid,
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Header */}
      <Header
        title="Command Dashboard"
        subtitle="Real-time financial analytics, client cycles & deliverable tracking"
        onOpenNewClient={() => setIsClientModalOpen(true)}
        onOpenNewProject={() => setIsProjectModalOpen(true)}
      />

      {/* Primary Key Stats Row */}
      {isLoading || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton variant="stat" />
          <LoadingSkeleton variant="stat" />
          <LoadingSkeleton variant="stat" />
          <LoadingSkeleton variant="stat" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Earnings */}
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Lifetime Earnings
              </span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              <AnimatedCounter value={stats.totalEarnings} prefix="Rs. " />
            </div>
            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-emerald-400" />
              <span>Paid retainers & completed projects</span>
            </p>
          </div>

          {/* Earned This Month */}
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Earned This Month
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              <AnimatedCounter value={stats.earnedThisMonth} prefix="Rs. " />
            </div>
            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
              <span>Avg monthly retainer run rate: </span>
              <span className="text-slate-200 font-semibold">
                {formatPKR(stats.averageMonthlyEarning)}
              </span>
            </p>
          </div>

          {/* Payments Due (Yet to receive) */}
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Payments Due (Pending)
              </span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">
              <AnimatedCounter value={stats.paymentsDue} prefix="Rs. " />
            </div>
            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>
                {stats.overdueCyclesCount > 0
                  ? `${stats.overdueCyclesCount} cycle(s) overdue`
                  : "Active unpaid balances"}
              </span>
            </p>
          </div>

          {/* Total Clients & Service Split */}
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Active Client Network
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Users size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              <AnimatedCounter value={stats.totalClients} />
              <span className="text-sm font-normal text-slate-400 ml-2">Clients</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
              <span className="text-cyan-400 font-medium">
                {stats.categoryCounts.graphic_design} Graphic
              </span>
              <span>•</span>
              <span className="text-purple-400 font-medium">
                {stats.categoryCounts.web_development} Web
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">
                {stats.categoryCounts.software_engineering} Software
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: CLIENT PAYMENT BEHAVIOR & RELIABILITY RADAR */}
      {/* (Requested: "how late clients are paying, which client is paying the too late, which pays on time or at least nearest to reset date etc") */}
      <div className="p-6 sm:p-7 rounded-2xl glass-card border border-white/[0.08] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                <Clock size={18} />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Payment Timing & Reliability Analysis
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tracks payment discipline: highlights clients who pay late vs those who pay on time or closest to their monthly reset date.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs">
              <span className="text-slate-400">Overall Average Delay: </span>
              <span className="font-bold text-cyan-300">
                {stats?.averageDaysLate || 0} days
              </span>
            </div>
          </div>
        </div>

        {/* Reliability Ranking Grid */}
        {!stats || stats.clientReliability.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            No completed billing cycles recorded yet to compute timing reliability.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.clientReliability.map((client) => {
              const isLate = client.status === "frequently_late";
              const isModerate = client.status === "moderate";

              return (
                <div
                  key={client.client_id}
                  className={`p-4 rounded-xl border transition-all ${
                    isLate
                      ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50"
                      : isModerate
                      ? "bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50"
                      : "bg-emerald-950/15 border-emerald-500/30 hover:border-emerald-500/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {client.business_name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {client.client_name}
                      </p>
                    </div>

                    <CustomBadge
                      type={
                        isLate
                          ? "late_paid"
                          : isModerate
                          ? "partial"
                          : "paid"
                      }
                      size="sm"
                      label={
                        isLate
                          ? "Pays Late"
                          : isModerate
                          ? "Moderate"
                          : "On-Time Payer"
                      }
                    />
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cycle Reset Day:</span>
                      <span className="font-semibold text-slate-200">
                        {client.cycle_reset_day}th of month
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Average Delay:</span>
                      <span
                        className={`font-bold ${
                          isLate
                            ? "text-rose-400"
                            : isModerate
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {client.average_days_late === 0
                          ? "On Time (0 days delay)"
                          : `${client.average_days_late} days late`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">On-Time Ratio:</span>
                      <span className="font-semibold text-slate-300">
                        {client.on_time_ratio}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2">
                    <Link
                      href={`/clients/${client.client_id}`}
                      className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-between"
                    >
                      <span>View client cycle history</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: TWO COLUMNS - Monthly Cycles Radar & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Monthly Cycle Resets Tracker */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-card border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <Calendar size={18} className="text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Monthly Cycle Resets
                </h3>
                <p className="text-xs text-slate-400">
                  Clients whose billing cycle has reset or is currently due
                </p>
              </div>
            </div>

            <Link
              href="/cycles"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentCycles.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No active monthly retainer cycles.
              </p>
            ) : (
              recentCycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">
                        {cycle.client_business || cycle.client_name}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                        Reset: {cycle.cycle_reset_day}th
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>
                        Cycle: {formatDate(cycle.period_start)} - {formatDate(cycle.period_end)}
                      </span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">
                        Due: {formatDate(cycle.due_date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-sm text-white">
                        {formatPKR(cycle.amount)}
                      </div>
                      <CustomBadge
                        type={cycle.payment_status}
                        size="sm"
                        extraInfo={
                          cycle.days_late > 0 ? `${cycle.days_late}d late` : undefined
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openPaymentModal(
                          "cycle",
                          cycle.id,
                          cycle.client_business || cycle.client_name || "Monthly Retainer",
                          cycle.amount,
                          cycle.payment_status,
                          cycle.paid_amount
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.08] transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Active Projects & Post Calculator quick snapshot */}
        <div className="lg:col-span-5 p-6 rounded-2xl glass-card border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <Briefcase size={18} className="text-purple-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Active Projects & Deliverables
                </h3>
                <p className="text-xs text-slate-400">
                  Track projects with custom post calculators
                </p>
              </div>
            </div>

            <Link
              href="/projects"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentProjects.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No active projects found.
              </p>
            ) : (
              recentProjects.map((project) => {
                const totalDeliverables =
                  project.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

                return (
                  <div
                    key={project.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] space-y-2 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">
                            {project.title}
                          </h4>
                          {project.is_extra_project === 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 font-semibold">
                              Extra Project
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {project.client_business || project.client_name}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-cyan-300 block">
                          {formatPKR(project.total_amount)}
                        </span>
                        <CustomBadge type={project.payment_status} size="sm" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.04]">
                      <span className="text-slate-300">
                        {totalDeliverables > 0
                          ? `${totalDeliverables} post deliverable(s)`
                          : "Project scope"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openPaymentModal(
                              "project",
                              project.id,
                              project.title,
                              project.total_amount,
                              project.payment_status,
                              project.paid_amount
                            )
                          }
                          className="text-[11px] font-semibold text-slate-300 hover:text-white"
                        >
                          Payment
                        </button>
                        <span>•</span>
                        <Link
                          href={`/invoices/new?project_id=${project.id}`}
                          className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          Invoice
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSaved={loadDashboardData}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSaved={loadDashboardData}
      />

      <PaymentStatusModal
        isOpen={paymentModalData.isOpen}
        onClose={() =>
          setPaymentModalData((prev) => ({ ...prev, isOpen: false }))
        }
        onSuccess={loadDashboardData}
        entityType={paymentModalData.entityType}
        entityId={paymentModalData.entityId}
        title={paymentModalData.title}
        totalAmount={paymentModalData.totalAmount}
        currentStatus={paymentModalData.currentStatus}
        currentPaidAmount={paymentModalData.currentPaidAmount}
      />
    </div>
  );
}
