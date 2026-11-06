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
    <div
      id="invoice-document-root"
      className="invoice-container bg-white text-zinc-900 border border-zinc-200 shadow-2xl rounded-none w-full max-w-[800px] min-h-[1050px] mx-auto p-10 sm:p-14 font-sans flex flex-col justify-between select-text"
      style={{
        boxSizing: "border-box",
        pageBreakInside: "avoid",
      }}
    >
      {/* ================= REPEATING/TOP HEADER ================= */}
      <div className="invoice-header w-full border-b-2 border-zinc-900 pb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 overflow-hidden bg-black rounded-lg p-1 shrink-0 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Themed Edits"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-black tracking-tight leading-none uppercase">
                Themed Edits
              </h1>
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mt-1">
                Design • Web • Software Engineering
              </p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 leading-none">
              INVOICE
            </h2>
            <p className="text-xs font-mono font-bold text-zinc-700 mt-1">
              #{invoiceNumber}
            </p>
          </div>
        </div>

        {/* Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-zinc-200 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
              Issue Date
            </span>
            <span className="font-semibold text-zinc-900 mt-0.5 block">
              {formatDate(issueDate)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
              Due Date
            </span>
            <span className="font-semibold text-zinc-900 mt-0.5 block">
              {formatDate(dueDate)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
              Billed To
            </span>
            <span className="font-bold text-zinc-900 mt-0.5 block truncate">
              {client.business_name || client.name}
            </span>
            {client.business_name && client.name && (
              <span className="text-[10px] text-zinc-500 block truncate">
                Attn: {client.name}
              </span>
            )}
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
              Status
            </span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                balanceDue === 0
                  ? "bg-zinc-900 text-white"
                  : paidAmount > 0
                  ? "bg-zinc-200 text-zinc-900 border border-zinc-400"
                  : "bg-zinc-100 text-zinc-900 border border-zinc-300"
              }`}
            >
              {balanceDue === 0
                ? "Paid in Full"
                : paidAmount > 0
                ? "Partially Paid"
                : "Payment Due"}
            </span>
          </div>
        </div>
      </div>

      {/* ================= INVOICE BODY / LINE ITEMS ================= */}
      <div className="invoice-body flex-1 py-6 w-full flex flex-col justify-between">
        <div>
          {/* Project Title Banner */}
          {projectName && (
            <div className="mb-4 bg-zinc-50 border border-zinc-200 px-3.5 py-2 rounded">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
                Project / Deliverable Scope
              </span>
              <span className="text-xs font-bold text-zinc-900 mt-0.5 block">
                {projectName}
              </span>
            </div>
          )}

          {showBreakdown ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-900 bg-zinc-100 text-zinc-800 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Description / Item</th>
                    <th className="py-2.5 px-2 text-center w-16">Qty</th>
                    <th className="py-2.5 px-3 text-right w-24">Rate (PKR)</th>
                    <th className="py-2.5 px-3 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-zinc-900 block">
                          {item.name}
                        </span>
                        {item.notes && (
                          <span className="text-[10px] text-zinc-500 block mt-0.5">
                            {item.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center font-medium text-zinc-700">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-zinc-700">
                        {formatPKR(item.unitPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-zinc-900">
                        {formatPKR(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 border border-zinc-200 bg-zinc-50 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">
                    {projectName || "Creative & Engineering Deliverables"}
                  </h4>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Rendered professionally per project agreement.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                    Total Package
                  </span>
                  <span className="text-base font-black text-zinc-900">
                    {formatPKR(subtotal)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Financial Summary & Payment Accounts */}
        <div className="mt-8 pt-4 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          {/* Bank / EasyPaisa Information */}
          <div className="sm:col-span-7 space-y-3">
            {includeBankInfo && (
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 block border-b border-zinc-200 pb-1">
                  Remittance / Payment Accounts
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {/* Bank Account */}
                  <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                    <span className="font-bold text-zinc-900 block flex items-center gap-1">
                      <CreditCard size={12} />
                      <span>{bankName}</span>
                    </span>
                    <span className="text-zinc-600 block text-[10px] mt-1">
                      Title: <strong className="text-zinc-900">{accountTitle}</strong>
                    </span>
                    <span className="text-zinc-600 block text-[10px]">
                      Account: <strong className="font-mono text-zinc-900">{accountNumber}</strong>
                    </span>
                    <span className="text-zinc-600 block text-[10px] font-mono">
                      IBAN: {iban}
                    </span>
                  </div>

                  {/* EasyPaisa Account */}
                  <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                    <span className="font-bold text-zinc-900 block flex items-center gap-1">
                      <Smartphone size={12} />
                      <span>EasyPaisa</span>
                    </span>
                    <span className="text-zinc-600 block text-[10px] mt-1">
                      Title: <strong className="text-zinc-900">{epTitle}</strong>
                    </span>
                    <span className="text-zinc-600 block text-[10px]">
                      Mobile #: <strong className="font-mono text-zinc-900">{epNumber}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {notes && (
              <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
                  Payment Terms & Notes
                </span>
                <p className="text-zinc-700 text-[11px] mt-0.5 leading-relaxed">
                  {notes}
                </p>
              </div>
            )}
          </div>

          {/* Grand Totals Box */}
          <div className="sm:col-span-5 bg-zinc-50 border border-zinc-200 p-4 rounded text-xs space-y-2">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-zinc-900">{formatPKR(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-zinc-700">
                <span>Discount Applied:</span>
                <span className="font-semibold">- {formatPKR(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black text-zinc-900 pt-2 border-t border-zinc-200">
              <span>Grand Total:</span>
              <span>{formatPKR(grandTotal)}</span>
            </div>

            {paidAmount > 0 && (
              <div className="flex justify-between text-zinc-600 pt-1 text-[11px]">
                <span>Amount Paid:</span>
                <span className="font-semibold text-zinc-900">{formatPKR(paidAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black p-2.5 rounded bg-zinc-900 text-white mt-2">
              <span>Balance Due:</span>
              <span>{formatPKR(balanceDue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STICKY FOOTER (REPEATS AT BOTTOM) ================= */}
      <div className="invoice-footer w-full border-t-2 border-zinc-900 pt-4 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-4 flex-wrap text-[11px]">
            <span className="flex items-center gap-1 font-medium text-zinc-800">
              <InstagramIcon size={12} className="text-zinc-900" />
              <span>themed.edits.te</span>
            </span>
            <span className="flex items-center gap-1 font-medium text-zinc-800">
              <Mail size={12} className="text-zinc-900" />
              <span>themed.edits.co@gmail.com</span>
            </span>
            <span className="flex items-center gap-1 font-medium text-zinc-800">
              <Phone size={12} className="text-zinc-900" />
              <span>03323954620</span>
            </span>
          </div>

          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Themed Edits • Thank you for your business
          </div>
        </div>
      </div>
    </div>
  );
};
