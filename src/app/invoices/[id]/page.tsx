"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  ChevronLeft,
  CheckCircle2,
  Share2,
  Trash2,
  Edit2,
  ExternalLink,
} from "lucide-react";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ActionPopup } from "@/components/ui/ActionPopup";
import { Invoice, CompanySettings } from "@/lib/types";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchInvoice = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (res.ok) {
        const data = await res.json();
        setInvoice(data.invoice);
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const handleMarkPaid = async () => {
    if (!invoice) return;
    try {
      await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          paid_amount: invoice.grand_total,
        }),
      });
      fetchInvoice();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      router.push("/invoices");
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (isLoading || !invoice) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Action Header (Hidden in print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print pb-4 border-b border-white/[0.08]">
        <div>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ChevronLeft size={16} />
            <span>Back to Invoices</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {invoice.invoice_number}
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                invoice.status === "paid"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {invoice.status !== "paid" && (
            <button
              type="button"
              onClick={handleMarkPaid}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all shadow-sm"
            >
              <CheckCircle2 size={14} />
              <span>Mark as Paid</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition-all"
          >
            <Share2 size={14} />
            <span>{isCopied ? "Link Copied!" : "Share Link"}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-950/40 transition-all active:scale-95"
          >
            <Printer size={14} strokeWidth={2.5} />
            <span>Print / Save PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete invoice"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Invoice Document Layout */}
      <div>
        <InvoiceDocument
          invoiceNumber={invoice.invoice_number}
          issueDate={invoice.issue_date}
          dueDate={invoice.due_date}
          client={{
            name: invoice.client_name || "Client",
            business_name: invoice.client_business,
            email: invoice.client_email,
            phone: invoice.client_phone,
            category: invoice.client_category,
          }}
          projectName={invoice.project_title}
          items={invoice.items || []}
          showBreakdown={invoice.show_breakdown === 1}
          includeBankInfo={invoice.include_bank_info === 1}
          subtotal={invoice.subtotal}
          discount={invoice.discount}
          grandTotal={invoice.grand_total}
          paidAmount={invoice.paid_amount}
          paymentStatus={invoice.status}
          notes={invoice.notes}
          settings={settings || undefined}
        />
      </div>

      {/* Delete Popup */}
      <ActionPopup
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Invoice?"
        description="Are you sure you want to delete this invoice record?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
