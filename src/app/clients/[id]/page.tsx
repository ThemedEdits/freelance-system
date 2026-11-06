"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Briefcase,
  FileText,
  Plus,
  FilePlus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { ClientModal } from "@/components/clients/ClientModal";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { PaymentStatusModal } from "@/components/common/PaymentStatusModal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ActionPopup } from "@/components/ui/ActionPopup";
import { Client, MonthlyCycle, Project, Invoice } from "@/lib/types";
import { formatPKR, formatDate } from "@/lib/utils";

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
    <div className="space-y-6 pb-12">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Back to Clients</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors"
          >
            <Edit2 size={13} />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            title="Delete client"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Client Profile Header Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-zinc-950 border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <CustomBadge type={client.category} size="md" />
              <CustomBadge type={client.billing_type} size="md" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {client.business_name || client.name}
            </h1>
            {client.business_name && (
              <p className="text-xs text-zinc-400 mt-0.5">
                Primary Contact: {client.name}
              </p>
            )}

            <div className="mt-2.5 flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
              {client.phone && (
                <a
                  href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Phone size={13} className="text-zinc-400" />
                  <span>{client.phone} (WhatsApp)</span>
                </a>
              )}
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Mail size={13} className="text-zinc-400" />
                  <span>{client.email}</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsProjectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors"
            >
              <Briefcase size={14} className="text-zinc-400" />
              <span>Add Project</span>
            </button>

            <Link
              href={`/invoices/new?client_id=${client.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <FilePlus size={14} />
              <span>Generate Invoice</span>
            </Link>
          </div>
        </div>

        {/* Retainer & Reset Day Highlights */}
        {isMonthly && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-black border border-white/10">
              <span className="text-zinc-400 block mb-1">
                Fixed Monthly Retainer
              </span>
              <span className="text-lg font-bold text-white">
                {formatPKR(client.monthly_amount)}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-black border border-white/10">
              <span className="text-zinc-400 block mb-1">
                Cycle Reset Day
              </span>
              <span className="text-lg font-bold text-white">
                {client.cycle_reset_day}th of month
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-black border border-white/10">
              <span className="text-zinc-400 block mb-1">
                Active Cycle Count
              </span>
              <span className="text-lg font-bold text-white">
                {cycles.length} periods
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MONTHLY CYCLES TIMELINE */}
      {isMonthly && (
        <div className="p-5 sm:p-6 rounded-xl bg-zinc-950 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-zinc-400" />
              <h2 className="text-sm sm:text-base font-bold text-white">
                Monthly Billing Cycles History
              </h2>
            </div>
            <span className="text-xs text-zinc-400">
              Resets on day {client.cycle_reset_day}
            </span>
          </div>

          <div className="space-y-2.5">
            {cycles.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">
                No monthly billing cycles generated yet.
              </p>
            ) : (
              cycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="p-3.5 rounded-xl bg-black border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">
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
                    <div className="text-xs text-zinc-400 flex items-center gap-2 flex-wrap">
                      <span>Due: {formatDate(cycle.due_date)}</span>
                      {cycle.paid_at && (
                        <span>• Paid on: {formatDate(cycle.paid_at)}</span>
                      )}
                      {cycle.notes && <span>• Note: {cycle.notes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-white block">
                        {formatPKR(cycle.amount)}
                      </span>
                      {cycle.payment_status === "partial" && (
                        <span className="text-[11px] text-zinc-400">
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
                          title: client.business_name || client.name,
                          subtitle: `${formatDate(cycle.period_start)} to ${formatDate(cycle.period_end)}`,
                          totalAmount: cycle.amount,
                          currentStatus: cycle.payment_status,
                          currentPaidAmount: cycle.paid_amount,
                        })
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
      )}

      {/* PROJECTS & DELIVERABLES */}
      <div className="p-5 sm:p-6 rounded-xl bg-zinc-950 border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-zinc-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              Projects & Post Deliverables
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsProjectModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors"
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {projects.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">
              No projects added for this client yet.
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="p-3.5 rounded-xl bg-black border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white text-sm">{project.title}</h3>
                    {project.is_extra_project === 1 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/10 font-medium">
                        Extra Project
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-xs text-zinc-400 mt-1 max-w-lg">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
                    <CustomBadge type={project.category} size="sm" />
                    <CustomBadge type={project.payment_status} size="sm" />
                    {project.due_date && (
                      <span className="text-zinc-400 text-[11px]">
                        Due: {formatDate(project.due_date)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-white block">
                      {formatPKR(project.total_amount)}
                    </span>
                    {project.paid_amount > 0 && (
                      <span className="text-[11px] text-zinc-400">
                        Paid: {formatPKR(project.paid_amount)}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/invoices/new?project_id=${project.id}`}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                    title="Generate Invoice for Project"
                  >
                    <FilePlus size={15} />
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
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors"
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
      <div className="p-5 sm:p-6 rounded-xl bg-zinc-950 border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-zinc-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">Invoices History</h2>
          </div>

          <Link
            href={`/invoices/new?client_id=${client.id}`}
            className="text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Create Invoice</span>
          </Link>
        </div>

        <div className="space-y-2">
          {invoices.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">
              No invoices generated for this client yet.
            </p>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 rounded-xl bg-black border border-white/10 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-semibold text-sm text-white">
                    {inv.invoice_number}
                  </span>
                  <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
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
                    <span className="text-[10px] uppercase font-semibold text-zinc-400">
                      {inv.status}
                    </span>
                  </div>

                  <Link
                    href={`/invoices/${inv.id}`}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors"
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
        subtitle={paymentModalData.subtitle}
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
