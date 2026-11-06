"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  Save,
  ChevronLeft,
  Eye,
  Building2,
} from "lucide-react";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingTextarea } from "@/components/ui/FloatingTextarea";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CustomToggle } from "@/components/ui/CustomToggle";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { useToast } from "@/components/ui/Toast";
import { Client, Project, InvoiceItemSnapshot, CompanySettings } from "@/lib/types";
import { formatPKR, formatDate } from "@/lib/utils";

function NewInvoiceContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const preClientId = searchParams.get("client_id") || "";
  const preProjectId = searchParams.get("project_id") || "";
  const preCycleId = searchParams.get("cycle_id") || "";

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(preClientId);
  const [selectedProjectId, setSelectedProjectId] = useState(preProjectId);
  const [generationMode, setGenerationMode] = useState<"project" | "client">(
    preProjectId ? "project" : "client"
  );

  // Configuration Toggles (as specifically requested in prompt!)
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [includeBankInfo, setIncludeBankInfo] = useState(true);
  const [includeMonthlyRetainer, setIncludeMonthlyRetainer] = useState(
    Boolean(preCycleId)
  );

  // Dates
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Financials & Notes
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState(
    "Thank you for partnering with Themed Edits. Please remit payment via Bank Transfer or EasyPaisa by the due date."
  );

  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  // Fetch initial clients, projects, settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes, sRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/projects"),
          fetch("/api/settings"),
        ]);

        if (cRes.ok) {
          const data = await cRes.json();
          setClients(data.clients || []);
          if (!selectedClientId && data.clients?.length > 0) {
            setSelectedClientId(data.clients[0].id);
          }
        }
        if (pRes.ok) {
          const data = await pRes.json();
          setProjects(data.projects || []);
        }
        if (sRes.ok) {
          const data = await sRes.json();
          setCompanySettings(data.settings);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const clientProjects = projects.filter((p) => p.client_id === selectedClientId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Sync project discount when a specific project is selected
  useEffect(() => {
    if (generationMode === "project" && selectedProject) {
      if (selectedProject.discount !== undefined && selectedProject.discount !== null) {
        setDiscount(selectedProject.discount);
      }
      if (selectedProject.discount_type) {
        setDiscountType(selectedProject.discount_type);
      }
    }
  }, [generationMode, selectedProjectId, selectedProject]);

  // Build items snapshot based on mode & selections
  let itemsToInclude: InvoiceItemSnapshot[] = [];
  let calculatedSubtotal = 0;

  if (generationMode === "project" && selectedProject) {
    if (selectedProject.items && selectedProject.items.length > 0) {
      itemsToInclude = selectedProject.items.map((i) => ({
        name: i.item_type,
        quantity: i.quantity,
        unitPrice: i.unit_price,
        total: i.total_price,
        notes: i.notes,
      }));
    } else {
      itemsToInclude = [
        {
          name: selectedProject.title,
          quantity: 1,
          unitPrice: selectedProject.total_amount,
          total: selectedProject.total_amount,
        },
      ];
    }
  } else if (generationMode === "client" && selectedClient) {
    // Combine all projects for this client
    for (const proj of clientProjects) {
      if (proj.items && proj.items.length > 0) {
        for (const it of proj.items) {
          itemsToInclude.push({
            name: `${proj.title} • ${it.item_type}`,
            quantity: it.quantity,
            unitPrice: it.unit_price,
            total: it.total_price,
          });
        }
      } else {
        itemsToInclude.push({
          name: proj.title,
          quantity: 1,
          unitPrice: proj.total_amount,
          total: proj.total_amount,
        });
      }
    }
  }

  // Include monthly retainer if toggled!
  if (includeMonthlyRetainer && selectedClient && selectedClient.monthly_amount > 0) {
    itemsToInclude.push({
      name: `Monthly Retainer Agreement (${formatDate(issueDate)})`,
      quantity: 1,
      unitPrice: selectedClient.monthly_amount,
      total: selectedClient.monthly_amount,
      notes: `Cycle resets on ${selectedClient.cycle_reset_day}th of every month`,
    });
  }

  // Calculate subtotal, discount, grand total
  calculatedSubtotal = itemsToInclude.reduce((acc, i) => acc + (i.total || 0), 0);
  const discountAmt =
    discountType === "percentage"
      ? (calculatedSubtotal * Math.min(100, Math.max(0, discount))) / 100
      : Math.min(calculatedSubtotal, Math.max(0, discount));
  const grandTotal = Math.max(0, calculatedSubtotal - discountAmt);

  const handleSaveInvoice = async () => {
    if (!selectedClientId) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: selectedClientId,
          project_id: generationMode === "project" ? selectedProjectId : null,
          cycle_id: preCycleId || null,
          issue_date: issueDate,
          due_date: dueDate,
          items: itemsToInclude,
          subtotal: calculatedSubtotal,
          discount: discountAmt,
          grand_total: grandTotal,
          paid_amount: Number(paidAmount) || 0,
          show_breakdown: showBreakdown ? 1 : 0,
          include_bank_info: includeBankInfo ? 1 : 0,
          include_monthly_retainer: includeMonthlyRetainer ? 1 : 0,
          notes,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save invoice");
      }

      const data = await res.json();
      showToast({
        type: "success",
        title: "Invoice Generated",
        message: `Invoice #${data.invoice.invoice_number} created successfully.`,
      });
      router.push(`/invoices/${data.invoice.id}`);
    } catch (e: any) {
      showToast({
        type: "error",
        title: "Invoice Generation Failed",
        message: e.message || "Error saving invoice.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-1"
          >
            <ChevronLeft size={14} />
            <span>Back to Invoices</span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Create Branded Invoice
          </h1>
          <p className="text-xs text-zinc-400">
            Generate customized invoice with live post deliverable calculations and bank details
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile view toggle */}
          <div className="flex xl:hidden rounded-lg bg-zinc-900 border border-white/10 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                activeTab === "editor"
                  ? "bg-white text-black font-semibold"
                  : "text-zinc-400"
              }`}
            >
              Configure
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                activeTab === "preview"
                  ? "bg-white text-black font-semibold"
                  : "text-zinc-400"
              }`}
            >
              Live Preview
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 transition-colors"
          >
            <Printer size={14} />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            disabled={isSaving || !selectedClientId}
            onClick={handleSaveInvoice}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? "Saving..." : "Save & Generate"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Document */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Customization Controls */}
        <div
          className={`xl:col-span-5 space-y-4 ${
            activeTab === "preview" ? "hidden xl:block" : "block"
          }`}
        >
          {/* Client & Scope Selection */}
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Building2 size={15} className="text-zinc-400" />
              <span>Client & Scope Selection</span>
            </h3>

            <CustomSelect
              label="Select Client *"
              value={selectedClientId}
              onChange={(val) => {
                setSelectedClientId(val);
                setSelectedProjectId("");
              }}
              options={clients.map((c) => ({
                value: c.id,
                label: c.business_name || c.name,
                description: `${c.billing_type} • ${c.category.replace("_", " ")}`,
              }))}
            />

            {/* Mode: Project vs Client */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                Invoice Generation Scope
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGenerationMode("project")}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition-colors text-left ${
                    generationMode === "project"
                      ? "bg-white text-black font-semibold border-white"
                      : "bg-black border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="block font-semibold">Specific Project</span>
                  <span className="text-[10px] font-normal opacity-75">
                    Generate for one project
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setGenerationMode("client")}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition-colors text-left ${
                    generationMode === "client"
                      ? "bg-white text-black font-semibold border-white"
                      : "bg-black border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="block font-semibold">All Client Projects</span>
                  <span className="text-[10px] font-normal opacity-75">
                    Consolidated invoice
                  </span>
                </button>
              </div>
            </div>

            {generationMode === "project" && (
              <CustomSelect
                label="Choose Project"
                value={selectedProjectId}
                onChange={(val) => setSelectedProjectId(val)}
                options={clientProjects.map((p) => ({
                  value: p.id,
                  label: p.title,
                  description: `${formatPKR(p.total_amount)} • ${p.items?.length || 0} deliverables`,
                }))}
                placeholder="Select project..."
              />
            )}
          </div>

          {/* Toggle Switches (Requested in prompt!) */}
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Invoice Customization Toggles
            </h3>

            {/* Toggle 1: Itemized breakdown vs Summary mode */}
            <CustomToggle
              label="Include Detailed Post Breakdown"
              sublabel={
                showBreakdown
                  ? "Showing all post types, quantities, rates and line totals"
                  : "Summary mode: only project title and total amount"
              }
              checked={showBreakdown}
              onChange={setShowBreakdown}
            />

            {/* Toggle 2: Include Monthly Retainer (on choice!) */}
            {selectedClient && selectedClient.monthly_amount > 0 && (
              <CustomToggle
                label={`Include Monthly Retainer (${formatPKR(selectedClient.monthly_amount)})`}
                sublabel="Appends the fixed monthly retainer fee to this invoice."
                checked={includeMonthlyRetainer}
                onChange={setIncludeMonthlyRetainer}
              />
            )}

            {/* Toggle 3: Include Bank & EasyPaisa info */}
            <CustomToggle
              label="Include Bank & EasyPaisa Details"
              sublabel="Prints Meezan Bank & EasyPaisa 03323954620 account numbers at the bottom."
              checked={includeBankInfo}
              onChange={setIncludeBankInfo}
            />
          </div>

          {/* Dates & Discounts */}
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Dates, Discounts & Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <CustomDatePicker
                label="Issue Date"
                value={issueDate}
                onChange={setIssueDate}
              />
              <CustomDatePicker
                label="Due Date"
                value={dueDate}
                onChange={setDueDate}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
              <div>
                <span className="block mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Discount Type
                </span>
                <div className="flex rounded-lg bg-black border border-white/10 p-1">
                  <button
                    type="button"
                    onClick={() => setDiscountType("fixed")}
                    className={`flex-1 py-1.5 text-xs font-medium rounded ${
                      discountType === "fixed"
                        ? "bg-white text-black font-semibold"
                        : "text-zinc-400"
                    }`}
                  >
                    Fixed (Rs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("percentage")}
                    className={`flex-1 py-1.5 text-xs font-medium rounded ${
                      discountType === "percentage"
                        ? "bg-white text-black font-semibold"
                        : "text-zinc-400"
                    }`}
                  >
                    Percent (%)
                  </button>
                </div>
              </div>

              <FloatingInput
                label={discountType === "fixed" ? "Discount Amount" : "Discount Percentage"}
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              />
            </div>

            <FloatingTextarea
              label="Payment Terms & Custom Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Right Column: High Fidelity Live Invoice Preview */}
        <div
          className={`xl:col-span-7 ${
            activeTab === "editor" ? "hidden xl:block" : "block"
          }`}
        >
          <div className="sticky top-20">
            <div className="flex items-center justify-between pb-3 px-1 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-zinc-400" />
                <span>Live Invoice Document Preview</span>
              </span>
              <span className="font-mono text-zinc-300 font-medium">
                {itemsToInclude.length} deliverable item(s) included
              </span>
            </div>

            {selectedClient ? (
              <InvoiceDocument
                invoiceNumber="TE-INV-PREVIEW"
                issueDate={issueDate}
                dueDate={dueDate}
                client={{
                  name: selectedClient.name,
                  business_name: selectedClient.business_name,
                  email: selectedClient.email,
                  phone: selectedClient.phone,
                  category: selectedClient.category,
                }}
                projectName={
                  generationMode === "project" && selectedProject
                    ? selectedProject.title
                    : `${selectedClient.business_name || selectedClient.name} • Deliverables Package`
                }
                items={itemsToInclude}
                showBreakdown={showBreakdown}
                includeBankInfo={includeBankInfo}
                subtotal={calculatedSubtotal}
                discount={discountAmt}
                grandTotal={grandTotal}
                paidAmount={paidAmount}
                paymentStatus={paidAmount >= grandTotal ? "paid" : "unpaid"}
                notes={notes}
                settings={companySettings || undefined}
              />
            ) : (
              <div className="p-12 text-center rounded-xl bg-zinc-950 border border-white/10 text-zinc-400 text-xs">
                Please select a client to preview the invoice.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Loading invoice generator...</div>}>
      <NewInvoiceContent />
    </Suspense>
  );
}
