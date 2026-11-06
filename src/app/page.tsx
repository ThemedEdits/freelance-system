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
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { ClientModal } from "@/components/clients/ClientModal";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { PaymentStatusModal } from "@/components/common/PaymentStatusModal";
import { DashboardStats, MonthlyCycle, Project } from "@/lib/types";
import { formatPKR, formatDate } from "@/lib/utils";

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
    subtitle?: string;
    totalAmount: number;
    currentStatus: any;
    currentPaidAmount: number;
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
    paid: number,
    subtitle?: string
  ) => {
    setPaymentModalData({
      isOpen: true,
      entityType: type,
      entityId: id,
      title,
      subtitle,
      totalAmount: total,
      currentStatus: status,
      currentPaidAmount: paid,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <Header
        title="Dashboard"
        subtitle="Real-time financial analytics, client cycles & deliverable tracking"
        onOpenNewClient={() => setIsClientModalOpen(true)}
        onOpenNewProject={() => setIsProjectModalOpen(true)}
      />

      {/* Section 1: KPI CARDS */}
      {isLoading || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <LoadingSkeleton variant="stat" />
          <LoadingSkeleton variant="stat" />
          <LoadingSkeleton variant="stat" />
          <LoadingSkeleton variant="stat" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Earnings */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Total Lifetime Earnings
              </span>
              <div className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 border border-white/10">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              <AnimatedCounter value={stats.totalEarnings} prefix="Rs. " />
            </div>
            <p className="mt-2 text-xs text-zinc-400 flex items-center gap-1.5">
              <TrendingUp size={12} className="text-zinc-300" />
              <span>Paid retainers & completed projects</span>
            </p>
          </div>

          {/* Earned This Month */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Earned This Month
              </span>
              <div className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 border border-white/10">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              <AnimatedCounter value={stats.earnedThisMonth} prefix="Rs. " />
            </div>
            <p className="mt-2 text-xs text-zinc-400 flex items-center gap-1.5">
              <span>Avg run rate: </span>
              <span className="text-zinc-200 font-semibold">
                {formatPKR(stats.averageMonthlyEarning)}
              </span>
            </p>
          </div>

          {/* Payments Due (Yet to receive) */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Payments Due (Pending)
              </span>
              <div className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 border border-white/10">
                <AlertCircle size={16} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              <AnimatedCounter value={stats.paymentsDue} prefix="Rs. " />
            </div>
            <p className="mt-2 text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>
                {stats.overdueCyclesCount > 0
                  ? `${stats.overdueCyclesCount} cycle(s) overdue`
                  : "Active unpaid balances"}
              </span>
            </p>
          </div>

          {/* Total Clients & Service Split */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Active Clients
              </span>
              <div className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 border border-white/10">
                <Users size={16} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              <AnimatedCounter value={stats.totalClients} />
              <span className="text-xs font-normal text-zinc-400 ml-2">Clients</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400 flex-wrap">
              <span className="text-zinc-300">
                {stats.categoryCounts.graphic_design} Graphic
              </span>
              <span>•</span>
              <span className="text-zinc-300">
                {stats.categoryCounts.web_development} Web
              </span>
              <span>•</span>
              <span className="text-zinc-300">
                {stats.categoryCounts.software_engineering} Software
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: CLIENT PAYMENT BEHAVIOR & RELIABILITY RADAR */}
      <div className="p-5 sm:p-6 rounded-xl bg-zinc-950 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-zinc-400" />
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Payment Timing & Reliability Analysis
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tracks payment discipline: highlights clients who pay late vs those who pay on time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs">
              <span className="text-zinc-400">Average Delay: </span>
              <span className="font-semibold text-white">
                {stats?.averageDaysLate || 0} days
              </span>
            </div>
          </div>
        </div>

        {/* Reliability Ranking Grid */}
        {!stats || stats.clientReliability.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No completed billing cycles recorded yet to compute timing reliability.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.clientReliability.map((client) => {
              const isLate = client.status === "frequently_late";
              const isModerate = client.status === "moderate";

              return (
                <div
                  key={client.client_id}
                  className="p-4 rounded-xl bg-black border border-white/10 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {client.business_name}
                      </h4>
                      <p className="text-xs text-zinc-400">
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

                  <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Cycle Reset Day:</span>
                      <span className="font-medium text-white">
                        {client.cycle_reset_day}th of month
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">Average Delay:</span>
                      <span className="font-medium text-white">
                        {client.average_days_late === 0
                          ? "On Time (0d delay)"
                          : `${client.average_days_late} days late`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">On-Time Ratio:</span>
                      <span className="font-medium text-white">
                        {client.on_time_ratio}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/clients/${client.client_id}`}
                      className="text-xs text-zinc-300 hover:text-white flex items-center justify-between"
                    >
                      <span>View client history</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Monthly Cycles Radar & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-zinc-950 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-zinc-400" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Monthly Cycle Resets
                </h3>
                <p className="text-xs text-zinc-400">
                  Clients whose billing cycle has reset or is currently due
                </p>
              </div>
            </div>

            <Link
              href="/cycles"
              className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentCycles.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">
                No active monthly retainer cycles.
              </p>
            ) : (
              recentCycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="p-3.5 rounded-xl bg-black border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-white">
                        {cycle.client_business || cycle.client_name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/10">
                        Reset: {cycle.cycle_reset_day}th
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 flex items-center gap-1.5 flex-wrap">
                      <span>
                        Cycle: {formatDate(cycle.period_start)} - {formatDate(cycle.period_end)}
                      </span>
                      <span>•</span>
                      <span className="text-zinc-300">
                        Due: {formatDate(cycle.due_date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-left sm:text-right">
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
                          cycle.paid_amount,
                          `${formatDate(cycle.period_start)} to ${formatDate(cycle.period_end)}`
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-zinc-950 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-zinc-400" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Active Projects & Deliverables
                </h3>
                <p className="text-xs text-zinc-400">
                  Track projects with custom post calculators
                </p>
              </div>
            </div>

            <Link
              href="/projects"
              className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentProjects.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">
                No active projects found.
              </p>
            ) : (
              recentProjects.map((project) => {
                const totalDeliverables =
                  project.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

                return (
                  <div
                    key={project.id}
                    className="p-3.5 rounded-xl bg-black border border-white/10 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm text-white truncate">
                            {project.title}
                          </h4>
                          {project.is_extra_project === 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/10 font-medium">
                              Extra Project
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 truncate">
                          {project.client_business || project.client_name}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-white block">
                          {formatPKR(project.total_amount)}
                        </span>
                        <CustomBadge type={project.payment_status} size="sm" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/5">
                      <span className="text-zinc-300 text-[11px]">
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
                          className="text-[11px] font-medium text-zinc-300 hover:text-white"
                        >
                          Payment
                        </button>
                        <span>•</span>
                        <Link
                          href={`/invoices/new?project_id=${project.id}&client_id=${project.client_id}`}
                          className="text-[11px] font-medium text-white hover:underline"
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
        subtitle={paymentModalData.subtitle}
        totalAmount={paymentModalData.totalAmount}
        currentStatus={paymentModalData.currentStatus}
        currentPaidAmount={paymentModalData.currentPaidAmount}
      />
    </div>
  );
}
