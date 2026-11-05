"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  FilePlus,
  Search,
  Printer,
  ExternalLink,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActionPopup } from "@/components/ui/ActionPopup";
import { Invoice } from "@/lib/types";
import { formatPKR, formatDate } from "@/lib/billing";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      let url = "/api/invoices?";
      if (selectedStatus !== "all") {
        url += `status=${selectedStatus}&`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [selectedStatus]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await fetch(`/api/invoices/${deletingId}`, { method: "DELETE" });
      setDeletingId(null);
      fetchInvoices();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return (
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.client_name?.toLowerCase().includes(q) ||
      inv.client_business?.toLowerCase().includes(q) ||
      inv.project_title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <Header
        title="Official Invoices"
        subtitle="Generate, preview and export sleek branded invoices for Themed Edits clients"
      />

      {/* Top Filter & Generator CTA */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/[0.08]">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Invoices" },
            { id: "sent", label: "Sent / Pending" },
            { id: "paid", label: "Paid Complete" },
            { id: "partial", label: "Partially Paid" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === st.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Right side: Search & Create */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search invoice #, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/[0.08] focus:border-cyan-500/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-950/40 transition-all active:scale-95 whitespace-nowrap"
          >
            <FilePlus size={14} strokeWidth={2.5} />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>

      {/* Invoices Grid */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={32} />}
          title="No invoices found"
          description="Create your first invoice for a selected project or client with custom itemized breakdown or summary view."
          actionText="Create Invoice Now"
          onAction={() => (window.location.href = "/invoices/new")}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => {
            const isPaid = inv.status === "paid";
            const balanceDue = Math.max(0, inv.grand_total - (inv.paid_amount || 0));

            return (
              <div
                key={inv.id}
                className="p-5 rounded-2xl glass-card border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-extrabold text-base text-cyan-300">
                      {inv.invoice_number}
                    </span>

                    <CustomBadge
                      type={isPaid ? "paid" : inv.status === "partial" ? "partial" : "unpaid"}
                      size="sm"
                      label={
                        isPaid
                          ? "Paid"
                          : inv.status === "partial"
                          ? "Partially Paid"
                          : "Sent / Pending"
                      }
                    />

                    {inv.show_breakdown === 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                        Summary Mode
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-white">
                    {inv.client_business || inv.client_name}
                    {inv.project_title && (
                      <span className="text-xs font-normal text-slate-400 ml-2">
                        • {inv.project_title}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span>Issued: {formatDate(inv.issue_date)}</span>
                    <span>•</span>
                    <span>Due: <strong>{formatDate(inv.due_date)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                  <div className="text-right">
                    <span className="text-lg font-black text-white block">
                      {formatPKR(inv.grand_total)}
                    </span>
                    {balanceDue > 0 && inv.paid_amount > 0 && (
                      <span className="text-xs text-amber-400 block">
                        Due: {formatPKR(balanceDue)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-white/[0.08] transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink size={13} />
                      <span>View & Print</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setDeletingId(inv.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete invoice"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Popup */}
      <ActionPopup
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Invoice?"
        description="Are you sure you want to delete this invoice record?"
        confirmText="Delete Invoice"
        variant="danger"
      />
    </div>
  );
}
