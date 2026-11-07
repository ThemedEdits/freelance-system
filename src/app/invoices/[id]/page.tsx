"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  Download,
  ChevronLeft,
  CheckCircle2,
  Share2,
  Trash2,
} from "lucide-react";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ActionPopup } from "@/components/ui/ActionPopup";
import { useToast } from "@/components/ui/Toast";
import { Invoice, CompanySettings } from "@/lib/types";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { showToast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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
      showToast({
        type: "success",
        title: "Marked as Paid",
        message: `Invoice #${invoice.invoice_number} marked paid in full.`,
      });
      fetchInvoice();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      showToast({
        type: "info",
        title: "Invoice Deleted",
        message: "Invoice was removed successfully.",
      });
      router.push("/invoices");
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    showToast({
      type: "success",
      title: "Link Copied",
      message: "Direct link to invoice copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadPdf = async () => {
    if (typeof window === "undefined" || !invoice) return;
    const element = document.getElementById("invoice-document-root");
    if (!element) {
      window.print();
      return;
    }

    setIsDownloading(true);
    try {
      // @ts-ignore
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const opt = {
        margin: 0,
        filename: `${invoice.invoice_number}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          scrollX: 0,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().from(element).set(opt).save();

      showToast({
        type: "success",
        title: "PDF Downloaded",
        message: `${invoice.invoice_number}.pdf has been saved.`,
      });
    } catch (err) {
      console.error("html2pdf error, fallback to print:", err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
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
    <div className="space-y-6 pb-16">
      {/* Action Header (Hidden in print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print pb-4 border-b border-white/10">
        <div>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-1"
          >
            <ChevronLeft size={14} />
            <span>Back to Invoices</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {invoice.invoice_number}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-white/10 font-medium uppercase tracking-wider text-white">
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {invoice.status !== "paid" && (
            <button
              type="button"
              onClick={handleMarkPaid}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors"
            >
              <CheckCircle2 size={13} className="text-zinc-400" />
              <span>Mark as Paid</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors"
          >
            <Share2 size={13} />
            <span>{isCopied ? "Link Copied!" : "Share Link"}</span>
          </button>

          {/* Direct Download PDF Button */}
          <button
            type="button"
            disabled={isDownloading}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download size={13} />
            <span>{isDownloading ? "Generating PDF..." : "Download PDF"}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            title="Delete invoice"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Invoice Document Layout */}
      <div className="py-2 overflow-x-auto">
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
