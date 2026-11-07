"use client";

import React from "react";
import Image from "next/image";
import { formatPKR, formatDate } from "@/lib/utils";
import { CompanySettings, InvoiceItemSnapshot, PaymentStatus } from "@/lib/types";
import { Phone, Mail, Globe } from "lucide-react";
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
  const bankName = settings?.bank_name || "Meezan Bank";
  const bankDetails = settings?.bank_details || "Meezan Bank, Lasbela chawk branch";
  const accountTitle = settings?.account_title || "HAMMAD AHMED SARDAR";
  const accountNumber = settings?.account_number || "99560111470100";
  const iban = settings?.iban || "PK09MEZN0099560111470100";

  const epTitle = settings?.easypaisa_title || "HAMMAD AHMED SARDAR";
  const epNumber = settings?.easypaisa_number || "0332-3954620";
  const epDetails = settings?.easypaisa_details || "Easypaisa";

  const companyPhone = settings?.whatsapp || "+92 332 3954620";
  const companyEmail = settings?.email || "themed.edits.co@gmail.com";
  const companyInstagram = settings?.instagram || "themed.edits.te";
  const companyWebsite = settings?.website || "themededits.vercel.app";

  // Clean URLs for links
  const whatsappLink = `https://wa.me/${companyPhone.replace(/[^0-9]/g, "")}`;
  const emailLink = `mailto:${companyEmail}`;
  const instagramLink = `https://instagram.com/${companyInstagram.replace("@", "")}`;
  const websiteLink = companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`;

  // Formulate items to render:
  // If showBreakdown is true, map items. If empty, generate single line from projectName.
  // If showBreakdown is false, single line package summary.
  const displayItems =
    showBreakdown && items.length > 0
      ? items
      : [
          {
            name: projectName || "Creative & Engineering Deliverables",
            quantity: 1,
            unitPrice: subtotal,
            total: subtotal,
            notes: "Rendered professionally per project agreement.",
          },
        ];

  return (
    <div
      id="invoice-document-root"
      className="invoice-container bg-white text-black w-full max-w-[820px] mx-auto shadow-2xl font-sans relative flex flex-col justify-between select-text"
      style={{
        boxSizing: "border-box",
        minHeight: "1120px", // Standard A4 aspect height ratio
      }}
    >
      {/* ========================================================
          TOP HEADER SECTION: Black background bar with logo
          (Repeats on pages if printed multi-page)
      ======================================================== */}
      <header className="invoice-header-bar w-full bg-black py-4 px-8 flex items-center justify-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Themed Edits"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[#f5a623] font-black text-lg tracking-wider uppercase leading-none font-sans">
              Themed
            </span>
            <span className="text-[#f5a623] font-black text-lg tracking-wider uppercase leading-none font-sans">
              Edits
            </span>
          </div>
        </div>
      </header>

      {/* ========================================================
          INVOICE MAIN CONTENT
      ======================================================== */}
      <main className="w-full px-8 sm:px-12 pt-8 pb-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Info Grid: INVOICE title & Billed To on Left, Meta on Right */}
          <div className="flex items-start justify-between gap-6 pb-6">
            {/* Left: INVOICE & Billed to */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight leading-none uppercase">
                Invoice
              </h1>

              <div className="space-y-0.5 text-xs text-black">
                <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                  Billed to:
                </p>
                <p className="text-sm font-black text-black uppercase tracking-tight">
                  {client.name || "Client Name"}
                </p>
                {client.business_name && (
                  <p className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
                    {client.business_name}
                  </p>
                )}
                {client.phone && (
                  <p className="text-[11px] text-zinc-600 font-medium pt-0.5">
                    {client.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Meta Details (Invoice #, Issue Date, Due Date) */}
            <div className="text-right space-y-1.5 pt-2">
              <div className="grid grid-cols-2 gap-x-4 text-xs">
                <span className="font-bold text-black text-right">Invoice #</span>
                <span className="font-semibold text-black text-right font-mono">{invoiceNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 text-xs">
                <span className="font-bold text-black text-right">Issue Date</span>
                <span className="font-semibold text-black text-right">{formatDate(issueDate)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 text-xs">
                <span className="font-bold text-black text-right">Due Date</span>
                <span className="font-semibold text-black text-right">{formatDate(dueDate)}</span>
              </div>
            </div>
          </div>

          {/* ========================================================
              SERVICES TABLE
          ======================================================== */}
          <div className="w-full mt-4">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-black text-white text-[11px] font-bold tracking-wider">
                  <th className="py-2.5 px-3 text-center w-12 font-bold">No.</th>
                  <th className="py-2.5 px-4 font-bold">Service Description</th>
                  <th className="py-2.5 px-3 text-right w-24 font-bold">Price</th>
                  <th className="py-2.5 px-3 text-center w-16 font-bold">Qty.</th>
                  <th className="py-2.5 px-4 text-right w-28 font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-xs">
                {displayItems.map((item, index) => (
                  <tr key={index} className="align-middle">
                    <td className="py-3 px-3 text-center font-bold text-black text-xs">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-black block text-xs">
                        {item.name}
                      </span>
                      {item.notes && (
                        <span className="text-[10px] text-zinc-500 block mt-0.5">
                          {item.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-black">
                      {formatPKR(item.unitPrice)}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-black">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-black">
                      {formatPKR(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================
            ATTACHED SECTION:
            Terms & Conditions alongside Subtotal / Discount / GRAND TOTAL
            Immediately followed by Payment Info & Signature
            (Always attached to bottom of grand total section!)
        ======================================================== */}
        <div className="mt-8 space-y-6 pt-2">
          {/* Terms & Conditions (Left) and Grand Total (Right) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Left: Terms and Conditions */}
            <div className="sm:col-span-6 space-y-1 text-xs">
              <h4 className="font-bold text-black text-xs">Terms and Conditions</h4>
              <p className="text-[10px] text-zinc-600 leading-relaxed pr-2">
                {notes ||
                  "Please remit payment via Bank Transfer or EasyPaisa by the specified due date. Late payments may impact subsequent deliverables schedules. All services rendered professionally per agreement."}
              </p>
            </div>

            {/* Right: Subtotal, Discount & GRAND TOTAL Black Bar */}
            <div className="sm:col-span-6 space-y-1.5 text-xs">
              <div className="flex justify-between items-center py-0.5 px-2">
                <span className="font-bold text-black text-sm">Subtotal</span>
                <span className="font-bold text-black text-sm">{formatPKR(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center py-0.5 px-2">
                  <span className="font-bold text-black text-sm">Discount</span>
                  <span className="font-bold text-black text-sm">- {formatPKR(discount)}</span>
                </div>
              )}

              {/* Solid Black Grand Total Banner */}
              <div className="bg-black text-white px-4 py-2 flex justify-between items-center font-black text-sm uppercase tracking-wider">
                <span>Grand Total</span>
                <span className="text-base">{formatPKR(grandTotal)}</span>
              </div>

              {paidAmount > 0 && (
                <div className="flex justify-between items-center py-0.5 px-2 text-[11px] text-zinc-700">
                  <span className="font-medium">Amount Paid:</span>
                  <span className="font-bold text-black">{formatPKR(paidAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              Payment Info (Left) & Authorised Signature (Right)
              Sticked to the end of Grand Total section!
          ======================================================== */}
          {includeBankInfo && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end pt-2 border-t border-zinc-100">
              {/* Left: Payment Info Accounts with exact logos */}
              <div className="sm:col-span-7 space-y-3">
                <h4 className="font-bold text-black text-xs">Payment Info:</h4>

                {/* Meezan Bank Details */}
                <div className="flex items-start gap-3">
                  <div className="relative w-10 h-10 shrink-0 mt-0.5">
                    <Image
                      src="/meezan-logo.png"
                      alt="Meezan Bank"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-[10px] space-y-0.5 text-black">
                    <div className="flex gap-2">
                      <span className="text-zinc-500 w-16">Account #:</span>
                      <span className="font-bold text-black font-mono">{accountNumber}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-500 w-16">IBAN:</span>
                      <span className="font-bold text-black font-mono">{iban}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-500 w-16">A/C Name:</span>
                      <span className="font-bold text-black uppercase">{accountTitle}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-500 w-16">Bank Details:</span>
                      <span className="text-zinc-800">{bankDetails}</span>
                    </div>
                  </div>
                </div>

                {/* EasyPaisa Details */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="relative w-10 h-10 shrink-0 mt-0.5">
                    <Image
                      src="/easypaisa-logo.png"
                      alt="EasyPaisa"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-[10px] space-y-0.5 text-black">
                    <div className="flex gap-2">
                      <span className="text-zinc-500 w-16">Account #:</span>
                      <span className="font-bold text-black font-mono">{epNumber}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-500 w-16">A/C Name:</span>
                      <span className="font-bold text-black uppercase">{epTitle}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-500 w-16">Bank Details:</span>
                      <span className="text-zinc-800">{epDetails}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Authorised Sign */}
              <div className="sm:col-span-5 flex flex-col items-center justify-end text-center pb-2">
                <div className="relative w-36 h-20 mb-1 flex items-center justify-center">
                  <Image
                    src="/signature.png"
                    alt="Authorised Sign"
                    width={140}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="w-48 border-t border-zinc-400 pt-1.5 text-center">
                  <span className="text-[11px] font-bold text-black tracking-wide">
                    Authorised Sign
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================
          BOTTOM FOOTER SECTION: Black background bar with pill links
          (Phone, Email, Instagram, Website)
          Repeats at bottom of page!
      ======================================================== */}
      <footer className="invoice-footer-bar w-full bg-black py-3 px-4 sm:px-8 shrink-0 mt-auto">
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {/* WhatsApp / Phone Pill */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#f5a623] text-white text-[10px] sm:text-[11px] font-medium hover:bg-white/10 transition-colors"
          >
            <Phone size={11} className="text-[#f5a623]" />
            <span>{companyPhone}</span>
          </a>

          {/* Email Pill */}
          <a
            href={emailLink}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#f5a623] text-white text-[10px] sm:text-[11px] font-medium hover:bg-white/10 transition-colors"
          >
            <Mail size={11} className="text-[#f5a623]" />
            <span>{companyEmail}</span>
          </a>

          {/* Instagram Pill */}
          <a
            href={instagramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#f5a623] text-white text-[10px] sm:text-[11px] font-medium hover:bg-white/10 transition-colors"
          >
            <InstagramIcon size={11} className="text-[#f5a623]" />
            <span>{companyInstagram}</span>
          </a>

          {/* Website Pill */}
          <a
            href={websiteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#f5a623] text-white text-[10px] sm:text-[11px] font-medium hover:bg-white/10 transition-colors"
          >
            <Globe size={11} className="text-[#f5a623]" />
            <span>{companyWebsite}</span>
          </a>
        </div>
      </footer>
    </div>
  );
};