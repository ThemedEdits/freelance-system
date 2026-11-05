"use client";

import React from "react";
import Image from "next/image";
import { formatPKR, formatDate } from "@/lib/utils";
import { CompanySettings, InvoiceItemSnapshot, PaymentStatus } from "@/lib/types";
import { Mail, Phone, Building2, CreditCard, Smartphone } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

interface InvoiceDocumentProps {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  client: {
    name: string;
    business_name?: string;
    email?: string;
    phone?: string;
    category?: string;
  };
  projectName?: string;
  items: InvoiceItemSnapshot[];
  showBreakdown: boolean;
  includeBankInfo: boolean;
  subtotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  paymentStatus: PaymentStatus | string;
  notes?: string;
  settings?: Partial<CompanySettings>;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoiceNumber,
  issueDate,
  dueDate,
  client,
  projectName,
  items,
  showBreakdown,
  includeBankInfo,
  subtotal,
  discount,
  grandTotal,
  paidAmount,
  paymentStatus,
  notes,
  settings,
}) => {
  const balanceDue = Math.max(0, grandTotal - paidAmount);

  const bankName = settings?.bank_name || "Meezan Bank";
  const accountTitle = settings?.account_title || "Themed Edits";
  const accountNumber = settings?.account_number || "01020304050607";
  const iban = settings?.iban || "PK64MEZN0000000102030405";
  const epTitle = settings?.easypaisa_title || "Hammad Ahmed";
  const epNumber = settings?.easypaisa_number || "03323954620";

  return (
    <div className="invoice-container bg-slate-900 text-slate-100 p-8 sm:p-12 rounded-2xl border border-white/[0.1] shadow-2xl max-w-4xl mx-auto font-sans relative overflow-hidden print:bg-white print:text-slate-900 print:p-0 print:border-none print:shadow-none">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 print:hidden" />

      {/* HEADER SECTION (Fixed / Sleek) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-white/[0.1] print:border-slate-300">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-950/80 border border-white/[0.12] p-1.5 shrink-0 print:border-slate-300 print:bg-white shadow-[0_0_20px_rgba(0,229,255,0.15)]">
            <Image
              src="/logo.png"
              alt="Themed Edits"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white print:text-slate-900">
              Themed Edits
            </h1>
            <p className="text-xs font-semibold text-cyan-400 print:text-cyan-700 tracking-wider uppercase mt-0.5">
              Design • Web Development • Software Engineering
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 print:text-slate-600 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-cyan-400 print:text-slate-700" />
                themed.edits.co@gmail.com
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-cyan-400 print:text-slate-700" />
                03323954620
              </span>
            </div>
          </div>
        </div>

        <div className="sm:text-right">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 print:text-slate-600 block">
            INVOICE
          </span>
          <div className="text-xl font-extrabold text-cyan-400 print:text-slate-900 mt-0.5 tracking-tight">
            {invoiceNumber}
          </div>
          <div className="mt-2 text-xs text-slate-400 print:text-slate-600 space-y-0.5">
            <div>
              <span className="font-semibold text-slate-300 print:text-slate-800">
                Issue Date:{" "}
              </span>
              {formatDate(issueDate)}
            </div>
            <div>
              <span className="font-semibold text-slate-300 print:text-slate-800">
                Due Date:{" "}
              </span>
              <span className="text-amber-400 print:text-amber-700 font-bold">
                {formatDate(dueDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BILLED TO / CLIENT INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-white/[0.1] print:border-slate-300 text-sm">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 block mb-1">
            Billed To
          </span>
          <div className="font-bold text-base text-white print:text-slate-900">
            {client.business_name || client.name}
          </div>
          {client.business_name && client.name && (
            <div className="text-slate-300 print:text-slate-700 text-xs mt-0.5">
              Attn: {client.name}
            </div>
          )}
          {client.email && (
            <div className="text-slate-400 print:text-slate-600 text-xs mt-1">
              {client.email}
            </div>
          )}
          {client.phone && (
            <div className="text-slate-400 print:text-slate-600 text-xs">
              {client.phone}
            </div>
          )}
        </div>

        <div className="sm:text-right flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 block mb-1">
              Project / Scope
            </span>
            <div className="font-semibold text-white print:text-slate-900 text-sm">
              {projectName || "Comprehensive Deliverables"}
            </div>
          </div>

          <div className="mt-3">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                balanceDue === 0
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 print:border-emerald-600 print:text-emerald-800"
                  : paidAmount > 0
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 print:border-indigo-600 print:text-indigo-800"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30 print:border-rose-600 print:text-rose-800"
              }`}
            >
              Status:{" "}
              {balanceDue === 0
                ? "Paid in Full"
                : paidAmount > 0
                ? "Partially Paid"
                : "Payment Due"}
            </span>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="py-6">
        {showBreakdown ? (
          /* Itemized breakdown */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.12] print:border-slate-300 text-slate-400 print:text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Deliverable / Description</th>
                  <th className="py-3 px-2 text-center">Quantity</th>
                  <th className="py-3 px-2 text-right">Rate / Post</th>
                  <th className="py-3 px-2 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] print:divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-2">
                      <div className="font-medium text-white print:text-slate-900">
                        {item.name}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-center text-slate-300 print:text-slate-700 font-semibold">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-2 text-right text-slate-300 print:text-slate-700">
                      {formatPKR(item.unitPrice)}
                    </td>
                    <td className="py-3.5 px-2 text-right font-bold text-white print:text-slate-900">
                      {formatPKR(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Summary view (requested toggle option: project name, total amount, due date instead of all details) */
          <div className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.08] print:border-slate-300 print:bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-white print:text-slate-900">
                  {projectName || "Deliverables Package"}
                </h4>
                <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                  Professional creative & engineering services delivered per agreed specifications.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400 print:text-slate-600 block">
                  Amount
                </span>
                <span className="text-lg font-black text-cyan-400 print:text-slate-900">
                  {formatPKR(subtotal)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-end mt-6">
          <div className="w-full sm:w-72 space-y-2 text-sm pt-4 border-t border-white/[0.1] print:border-slate-300">
            <div className="flex justify-between text-slate-400 print:text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-white print:text-slate-900">
                {formatPKR(subtotal)}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-400 print:text-emerald-700">
                <span>Discount</span>
                <span>- {formatPKR(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold text-white print:text-slate-900 pt-2 border-t border-white/[0.08] print:border-slate-300">
              <span>Grand Total</span>
              <span className="text-cyan-400 print:text-slate-900">
                {formatPKR(grandTotal)}
              </span>
            </div>

            {paidAmount > 0 && (
              <div className="flex justify-between text-slate-400 print:text-slate-600 text-xs">
                <span>Amount Paid</span>
                <span className="text-emerald-400 print:text-emerald-700 font-semibold">
                  {formatPKR(paidAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-base font-extrabold p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 print:bg-slate-100 print:border-slate-300 print:text-slate-900 mt-2">
              <span>Balance Due</span>
              <span>{formatPKR(balanceDue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BANK & EASYPAISA PAYMENT DETAILS (Requested: "so clients won't have to ask again. It'll be in the invoice at the end.") */}
      {includeBankInfo && (
        <div className="mt-6 pt-6 border-t border-white/[0.1] print:border-slate-300">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-slate-700 block mb-3">
            Payment & Bank Transfer Details
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bank Card */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] print:border-slate-300 print:bg-slate-50 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm text-white print:text-slate-900 mb-1">
                <CreditCard size={15} className="text-cyan-400 print:text-slate-700" />
                <span>Bank Account ({bankName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Account Title:</span>
                <span className="font-semibold text-slate-200 print:text-slate-900">{accountTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Account Number:</span>
                <span className="font-mono font-semibold text-cyan-300 print:text-slate-900">{accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">IBAN:</span>
                <span className="font-mono text-[11px] text-slate-300 print:text-slate-800">{iban}</span>
              </div>
            </div>

            {/* EasyPaisa Card */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] print:border-slate-300 print:bg-slate-50 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm text-white print:text-slate-900 mb-1">
                <Smartphone size={15} className="text-emerald-400 print:text-slate-700" />
                <span>Easypaisa Account</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Account Title:</span>
                <span className="font-semibold text-slate-200 print:text-slate-900">{epTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Easypaisa Number:</span>
                <span className="font-mono font-bold text-emerald-400 print:text-emerald-800 text-sm">
                  {epNumber}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 print:text-slate-500 pt-1">
                Kindly share payment screenshot / transaction ID on WhatsApp once transferred.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes / Terms */}
      {notes && (
        <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-400 print:border-slate-200 print:text-slate-600">
          <span className="font-semibold text-slate-300 print:text-slate-800 block mb-0.5">
            Notes / Instructions:
          </span>
          <p>{notes}</p>
        </div>
      )}

      {/* FIXED FOOTER WITH ALL SOCIAL HANDLES (Requested: "Footer having all my socials") */}
      <div className="mt-8 pt-6 border-t border-white/[0.1] print:border-slate-300 text-xs text-slate-400 print:text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-5 flex-wrap">
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <InstagramIcon size={13} className="text-cyan-400 print:text-slate-700" />
            <span>Instagram: <strong>themed.edits.te</strong></span>
          </span>
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail size={13} className="text-cyan-400 print:text-slate-700" />
            <span>Email: <strong>themed.edits.co@gmail.com</strong></span>
          </span>
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone size={13} className="text-cyan-400 print:text-slate-700" />
            <span>WhatsApp: <strong>03323954620</strong></span>
          </span>
        </div>

        <div className="text-[11px] text-slate-500 print:text-slate-400">
          Themed Edits • Thank you for your partnership
        </div>
      </div>
    </div>
  );
};
