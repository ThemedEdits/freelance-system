"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Palette,
  Globe,
  Code2,
  Phone,
  Mail,
  ChevronRight,
  FilePlus,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { ClientModal } from "@/components/clients/ClientModal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPKR } from "@/lib/utils";

function ClientsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBilling, setSelectedBilling] = useState<string>("all");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      let url = "/api/clients?status=all";
      if (selectedCategory !== "all") {
        url += `&category=${selectedCategory}`;
      }
      if (selectedBilling !== "all") {
        url += `&billing_type=${selectedBilling}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (e) {
      console.error("Failed to load clients:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [selectedCategory, selectedBilling]);

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.business_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <Header
        title="Client Portfolio"
        subtitle="Manage regular monthly retainers, per-project agreements, and service categories"
        onOpenNewClient={() => setIsClientModalOpen(true)}
      />

      {/* Division Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/[0.08]">
        {/* Service Divisions */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-white/10 text-white shadow-md border border-white/20"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            All Services
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("graphic_design")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "graphic_design"
                ? "bg-cyan-500/20 text-cyan-300 shadow-md border border-cyan-500/40"
                : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            }`}
          >
            <Palette size={14} className="text-cyan-400" />
            <span>Graphic Design</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("web_development")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "web_development"
                ? "bg-purple-500/20 text-purple-300 shadow-md border border-purple-500/40"
                : "text-slate-400 hover:text-purple-300 hover:bg-purple-500/10"
            }`}
          >
            <Globe size={14} className="text-purple-400" />
            <span>Web Development</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("software_engineering")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "software_engineering"
                ? "bg-emerald-500/20 text-emerald-300 shadow-md border border-emerald-500/40"
                : "text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            }`}
          >
            <Code2 size={14} className="text-emerald-400" />
            <span>Software Clients</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search client, brand, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/[0.08] focus:border-cyan-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Billing Model Pills Filter */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="font-semibold text-slate-500 uppercase text-[10px]">
          Billing Model:
        </span>
        {[
          { id: "all", label: "All Types" },
          { id: "monthly", label: "Monthly Retainer" },
          { id: "per_project", label: "Per Project" },
          { id: "hybrid", label: "Hybrid (Monthly + Extra Projects)" },
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setSelectedBilling(type.id)}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              selectedBilling === type.id
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                : "bg-white/[0.02] text-slate-400 hover:text-white border border-white/[0.04]"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Client Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : filteredClients.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No clients found"
          description="No clients match your filter criteria. Create a client to begin managing their retainer cycles and deliverables."
          actionText="Add New Client"
          onAction={() => setIsClientModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const hasMonthly =
              client.billing_type === "monthly" || client.billing_type === "hybrid";

            return (
              <div
                key={client.id}
                className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-white/[0.18] transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <CustomBadge type={client.category} size="sm" />
                    <CustomBadge type={client.billing_type} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {client.business_name || client.name}
                  </h3>
                  {client.business_name && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Contact: {client.name}
                    </p>
                  )}

                  <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5 text-xs">
                    {hasMonthly ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Monthly Retainer:</span>
                          <span className="font-bold text-white">
                            {formatPKR(client.monthly_amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Cycle Reset Day:</span>
                          <span className="font-semibold text-cyan-400">
                            {client.cycle_reset_day}th of every month
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Billing Structure:</span>
                        <span className="text-amber-400 font-semibold">
                          Charged per deliverable/post
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1.5 border-t border-white/[0.04] text-[11px]">
                      <span className="text-slate-400">Total Projects:</span>
                      <span className="text-slate-200 font-medium">
                        {client.total_projects || 0} projects
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                    {client.phone && (
                      <a
                        href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                      >
                        <Phone size={12} className="text-emerald-400" />
                        <span>{client.phone}</span>
                      </a>
                    )}
                    {client.email && (
                      <a
                        href={`mailto:${client.email}`}
                        className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors truncate max-w-[150px]"
                      >
                        <Mail size={12} className="text-cyan-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <Link
                    href={`/invoices/new?client_id=${client.id}`}
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1.5"
                    title="Generate Invoice for Client"
                  >
                    <FilePlus size={14} className="text-cyan-400" />
                    <span>Invoice</span>
                  </Link>

                  <Link
                    href={`/clients/${client.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 transition-colors"
                  >
                    <span>View Client Profile</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Client Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSaved={fetchClients}
      />
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ClientsContent />
    </Suspense>
  );
}
