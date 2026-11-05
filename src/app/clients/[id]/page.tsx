"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  Briefcase,
  FileText,
  Plus,
  FilePlus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { ClientModal } from "@/components/clients/ClientModal";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { PaymentStatusModal } from "@/components/common/PaymentStatusModal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ActionPopup } from "@/components/ui/ActionPopup";
import { Client, MonthlyCycle, Project, Invoice } from "@/lib/types";
import { formatPKR, formatDate } from "@/lib/billing";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cycles, setCycles] = useState<MonthlyCycle[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setProjects(data.projects || []);
        setCycles(data.cycles || []);
        setInvoices(data.invoices || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleDeleteClient = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/clients");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || !client) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  const isMonthly =
    client.billing_type === "monthly" || client.billing_type === "hybrid";

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back to Clients</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-all"
          >
            <Edit2 size={13} />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete client"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Client Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl glass-card border border-white/[0.08] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <CustomBadge type={client.category} size="md" />
              <CustomBadge type={client.billing_type} size="md" />
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight">
              {client.business_name || client.name}
            </h1>
            {client.business_name && (
              <p className="text-sm text-slate-400 mt-0.5">
                Primary Contact: {client.name}
              </p>
            )}

            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              {client.phone && (
                <a
                  href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <Phone size={13} className="text-emerald-400" />
                  <span>{client.phone} (WhatsApp)</span>
                </a>
              )}
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <Mail size={13} className="text-cyan-400" />
                  <span>{client.email}</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsProjectModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.08] transition-all"
            >
              <Briefcase size={14} className="text-purple-400" />
              <span>Add Project</span>
            </button>

            <Link
              href={`/invoices/new?client_id=${client.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-950/40 transition-all active:scale-95"
            >
              <FilePlus size={14} strokeWidth={2.5} />
              <span>Generate Invoice</span>
            </Link>
          </div>
        </div>

        {/* Retainer & Reset Day Highlights */}
        {isMonthly && (
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-xs text-slate-400 block mb-1">
                Fixed Monthly Retainer
              </span>
              <span className="text-xl font-bold text-white">
                {formatPKR(client.monthly_amount)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-xs text-slate-400 block mb-1">
                Cycle Reset Day
              </span>
              <span className="text-xl font-bold text-cyan-400">
                {client.cycle_reset_day}th of every month
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-xs text-slate-400 block mb-1">
                Active Cycle Count
              </span>
              <span className="text-xl font-bold text-slate-200">
                {cycles.length} billing periods
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MONTHLY CYCLES TIMELINE */}
      {isMonthly && (
        <div className="p-6 rounded-2xl glass-card border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-cyan-400" />
              <h2 className="text-base font-bold text-white">
                Monthly Billing Cycles History
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Resets automatically every month on day {client.cycle_reset_day}
            </span>
          </div>

          <div className="space-y-3">
            {cycles.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No monthly billing cycles generated yet.
              </p>
            ) : (
              cycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {formatDate(cycle.period_start)} — {formatDate(cycle.period_end)}
                      </span>
                      <CustomBadge
                        type={cycle.payment_status}
                        size="sm"
                        extraInfo={
                          cycle.days_late > 0 ? `${cycle.days_late} days late` : undefined
                        }
                      />
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                      <span>Due Date: {formatDate(cycle.due_date)}</span>
                      {cycle.paid_at && (
                        <span>• Paid on: {formatDate(cycle.paid_at)}</span>
                      )}
                      {cycle.notes && <span>• Note: {cycle.notes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-white block">
                        {formatPKR(cycle.amount)}
                      </span>
                      {cycle.payment_status === "partial" && (
                        <span className="text-[11px] text-indigo-400">
                          Paid: {formatPKR(cycle.paid_amount)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPaymentModalData({
                          isOpen: true,
                          entityType: "cycle",
                          entityId: cycle.id,
                          title: `Cycle ${cycle.period_start}`,
                          totalAmount: cycle.amount,
                          currentStatus: cycle.payment_status,
                          currentPaidAmount: cycle.paid_amount,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.08] transition-colors"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PROJECTS & DELIVERABLES */}
      <div className="p-6 rounded-2xl glass-card border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-purple-400" />
            <h2 className="text-base font-bold text-white">
              Projects & Post Deliverables
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsProjectModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 transition-colors"
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>
        </div>

        <div className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              No projects added for this client yet.
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{project.title}</h3>
                    {project.is_extra_project === 1 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 font-semibold">
                        Extra Project
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-xs text-slate-400 mt-1 max-w-lg">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <CustomBadge type={project.category} size="sm" />
                    <CustomBadge type={project.payment_status} size="sm" />
                    {project.due_date && (
                      <span className="text-slate-400 text-[11px]">
                        Due: {formatDate(project.due_date)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base font-bold text-cyan-400 block">
                      {formatPKR(project.total_amount)}
                    </span>
                    {project.paid_amount > 0 && (
                      <span className="text-[11px] text-slate-400">
                        Paid: {formatPKR(project.paid_amount)}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/invoices/new?project_id=${project.id}`}
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                    title="Generate Invoice for Project"
                  >
                    <FilePlus size={16} className="text-cyan-400" />
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentModalData({
                        isOpen: true,
                        entityType: "project",
                        entityId: project.id,
                        title: project.title,
                        totalAmount: project.total_amount,
                        currentStatus: project.payment_status,
                        currentPaidAmount: project.paid_amount,
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.08] transition-colors"
                  >
                    Payment
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* INVOICES HISTORY */}
      <div className="p-6 rounded-2xl glass-card border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-cyan-400" />
            <h2 className="text-base font-bold text-white">Invoices History</h2>
          </div>

          <Link
            href={`/invoices/new?client_id=${client.id}`}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Create Invoice</span>
          </Link>
        </div>

        <div className="space-y-2.5">
          {invoices.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              No invoices generated for this client yet.
            </p>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex items-center justify-between gap-3 transition-all"
              >
                <div>
                  <span className="font-bold text-sm text-cyan-300">
                    {inv.invoice_number}
                  </span>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Issued: {formatDate(inv.issue_date)}</span>
                    <span>•</span>
                    <span>Due: {formatDate(inv.due_date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-white block">
                      {formatPKR(inv.grand_total)}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {inv.status}
                    </span>
                  </div>

                  <Link
                    href={`/invoices/${inv.id}`}
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <ClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={loadData}
        clientToEdit={client}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSaved={loadData}
        defaultClientId={client.id}
      />

      <PaymentStatusModal
        isOpen={paymentModalData.isOpen}
        onClose={() =>
          setPaymentModalData((prev) => ({ ...prev, isOpen: false }))
        }
        onSuccess={loadData}
        entityType={paymentModalData.entityType}
        entityId={paymentModalData.entityId}
        title={paymentModalData.title}
        totalAmount={paymentModalData.totalAmount}
        currentStatus={paymentModalData.currentStatus}
        currentPaidAmount={paymentModalData.currentPaidAmount}
      />

      <ActionPopup
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteClient}
        title="Delete Client Record?"
        description={`Are you sure you want to delete ${client.business_name || client.name}? This will permanently remove their projects, deliverable logs, and monthly cycle records.`}
        confirmText="Delete Client"
        variant="danger"
      />
    </div>
  );
}
