"use client";

import React from "react";
import Image from "next/image";
import { formatPKR, formatDate } from "@/lib/utils";
import { CompanySettings, InvoiceItemSnapshot, PaymentStatus } from "@/lib/types";
import { Mail, Phone, CreditCard, Smartphone } from "lucide-react";
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
    <div className="invoice-container bg-black text-zinc-100 p-6 sm:p-10 rounded-xl border border-white/10 shadow-2xl max-w-4xl mx-auto font-sans relative overflow-hidden print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
      {/* HEADER SECTION (Fixed / Sleek) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 print:border-zinc-300">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-950 border border-white/15 p-1 shrink-0 print:border-zinc-300 print:bg-white">
            <Image
              src="/logo.png"
              alt="Themed Edits"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white print:text-black">
              Themed Edits
            </h1>
            <p className="text-[11px] font-medium text-zinc-400 print:text-zinc-600 tracking-wider uppercase mt-0.5">
              Design • Web Development • Software Engineering
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 print:text-zinc-600 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail size={12} className="text-zinc-400 print:text-black" />
                themed.edits.co@gmail.com
              </span>
              <span className="flex items-center gap-1">
                <Phone size={12} className="text-zinc-400 print:text-black" />
                03323954620
              </span>
            </div>
          </div>
        </div>

        <div className="sm:text-right">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 print:text-zinc-600 block">
            INVOICE
          </span>
          <div className="text-lg font-bold text-white print:text-black tracking-tight">
            {invoiceNumber}
          </div>
          <div className="mt-1 text-xs text-zinc-400 print:text-zinc-600 space-y-0.5">
            <div>
              <span className="text-zinc-400">Issue Date: </span>
              <span className="text-white print:text-black font-medium">{formatDate(issueDate)}</span>
            </div>
            <div>
              <span className="text-zinc-400">Due Date: </span>
              <span className="text-white print:text-black font-medium">{formatDate(dueDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BILLED TO / CLIENT INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-white/10 print:border-zinc-300 text-xs">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 print:text-zinc-600 block mb-1">
            Billed To
          </span>
          <div className="font-bold text-sm text-white print:text-black">
            {client.business_name || client.name}
          </div>
          {client.business_name && client.name && (
            <div className="text-zinc-400 print:text-zinc-700 mt-0.5">
              Attn: {client.name}
            </div>
          )}
          {client.email && (
            <div className="text-zinc-400 print:text-zinc-600 mt-0.5">
              {client.email}
            </div>
          )}
          {client.phone && (
            <div className="text-zinc-400 print:text-zinc-600">
              {client.phone}
            </div>
          )}
        </div>

        <div className="sm:text-right flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 print:text-zinc-600 block mb-1">
              Project / Scope
            </span>
            <div className="font-medium text-white print:text-black text-xs">
              {projectName || "Comprehensive Deliverables"}
            </div>
          </div>

          <div className="mt-2">
            <span className="inline-block px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-[10px] font-semibold uppercase tracking-wider text-white print:border-zinc-400 print:text-black">
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
      <div className="py-5">
        {showBreakdown ? (
          /* Itemized breakdown */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 print:border-zinc-300 text-zinc-400 print:text-zinc-600 text-[10px] font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-2">Deliverable / Description</th>
                  <th className="py-2.5 px-2 text-center">Quantity</th>
                  <th className="py-2.5 px-2 text-right">Rate / Post</th>
                  <th className="py-2.5 px-2 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-zinc-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-2">
                      <div className="font-medium text-white print:text-black">
                        {item.name}
                      </div>
                      {item.notes && (
                        <div className="text-[10px] text-zinc-400 print:text-zinc-600 mt-0.5">
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center text-zinc-300 print:text-zinc-700">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-2 text-right text-zinc-300 print:text-zinc-700">
                      {formatPKR(item.unitPrice)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-white print:text-black">
                      {formatPKR(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Summary view (toggle option: project name, total amount, due date instead of all details) */
          <div className="p-4 rounded-lg bg-zinc-950 border border-white/10 print:border-zinc-300 print:bg-zinc-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm text-white print:text-black">
                  {projectName || "Deliverables Package"}
                </h4>
                <p className="text-xs text-zinc-400 print:text-zinc-600 mt-0.5">
                  Professional creative & engineering services delivered per agreed specifications.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 print:text-zinc-600 block">
                  Amount
                </span>
                <span className="text-base font-bold text-white print:text-black">
                  {formatPKR(subtotal)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-end mt-4">
          <div className="w-full sm:w-64 space-y-1.5 text-xs pt-3 border-t border-white/10 print:border-zinc-300">
            <div className="flex justify-between text-zinc-400 print:text-zinc-600">
              <span>Subtotal</span>
              <span className="font-medium text-white print:text-black">
                {formatPKR(subtotal)}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-zinc-400 print:text-zinc-700">
                <span>Discount</span>
                <span>- {formatPKR(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold text-white print:text-black pt-1.5 border-t border-white/5 print:border-zinc-300">
              <span>Grand Total</span>
              <span>{formatPKR(grandTotal)}</span>
            </div>

            {paidAmount > 0 && (
              <div className="flex justify-between text-zinc-400 print:text-zinc-600 text-xs">
                <span>Amount Paid</span>
                <span className="text-white print:text-black font-medium">
                  {formatPKR(paidAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold p-2 rounded-lg bg-zinc-900 border border-white/15 text-white print:bg-zinc-100 print:border-zinc-300 print:text-black mt-2">
              <span>Balance Due</span>
              <span>{formatPKR(balanceDue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BANK & EASYPAISA PAYMENT DETAILS */}
      {includeBankInfo && (
        <div className="mt-4 pt-4 border-t border-white/10 print:border-zinc-300">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 print:text-zinc-700 block mb-2">
            Payment & Bank Transfer Details
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Bank Card */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-white/10 print:border-zinc-300 print:bg-zinc-50 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-white print:text-black mb-1">
                <CreditCard size={13} className="text-zinc-400 print:text-black" />
                <span>Bank Account ({bankName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 print:text-zinc-600">Account Title:</span>
                <span className="font-medium text-zinc-200 print:text-black">{accountTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 print:text-zinc-600">Account Number:</span>
                <span className="font-mono font-medium text-white print:text-black">{accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 print:text-zinc-600">IBAN:</span>
                <span className="font-mono text-[10px] text-zinc-300 print:text-zinc-800">{iban}</span>
              </div>
            </div>

            {/* EasyPaisa Card */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-white/10 print:border-zinc-300 print:bg-zinc-50 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-white print:text-black mb-1">
                <Smartphone size={13} className="text-zinc-400 print:text-black" />
                <span>Easypaisa Account</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 print:text-zinc-600">Account Title:</span>
                <span className="font-medium text-zinc-200 print:text-black">{epTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 print:text-zinc-600">Easypaisa Number:</span>
                <span className="font-mono font-semibold text-white print:text-black">
                  {epNumber}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 print:text-zinc-500 pt-0.5">
                Share payment screenshot / TRX ID on WhatsApp once transferred.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes / Terms */}
      {notes && (
        <div className="mt-3 p-3 rounded-lg bg-zinc-950 border border-white/5 text-xs text-zinc-400 print:border-zinc-200 print:text-zinc-600">
          <span className="font-medium text-zinc-300 print:text-black block mb-0.5">
            Notes / Instructions:
          </span>
          <p>{notes}</p>
        </div>
      )}

      {/* FIXED FOOTER WITH ALL SOCIAL HANDLES */}
      <div className="mt-6 pt-4 border-t border-white/10 print:border-zinc-300 text-xs text-zinc-400 print:text-zinc-600 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 hover:text-white transition-colors">
            <InstagramIcon size={12} className="text-zinc-400 print:text-black" />
            <span>Instagram: <strong className="text-zinc-200">themed.edits.te</strong></span>
          </span>
          <span className="flex items-center gap-1 hover:text-white transition-colors">
            <Mail size={12} className="text-zinc-400 print:text-black" />
            <span>Email: <strong className="text-zinc-200">themed.edits.co@gmail.com</strong></span>
          </span>
          <span className="flex items-center gap-1 hover:text-white transition-colors">
            <Phone size={12} className="text-zinc-400 print:text-black" />
            <span>WhatsApp: <strong className="text-zinc-200">03323954620</strong></span>
          </span>
        </div>

        <div className="text-[10px] text-zinc-500 print:text-zinc-400">
          Themed Edits • Thank you for your partnership
        </div>
      </div>
    </div>
  );
};
