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
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-12">
      <Header
        title="Client Portfolio"
        subtitle="Manage regular monthly retainers, per-project agreements, and service categories"
        onOpenNewClient={() => setIsClientModalOpen(true)}
      />

      {/* Division Tabs & Search Bar */}
      <div className="flex flex-col gap-3 p-3 sm:p-4 rounded-2xl glass-card border border-white/10">
        {/* Service Divisions - Horizontal scroll with proper padding */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-white text-black font-semibold"
                : "text-zinc-400 hover:text-white bg-zinc-900"
            }`}
          >
            All Services
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("graphic_design")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "graphic_design"
                ? "bg-white text-black font-semibold"
                : "text-zinc-400 hover:text-white bg-zinc-900"
            }`}
          >
            <Palette size={13} />
            <span>Graphic Design</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("web_development")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "web_development"
                ? "bg-white text-black font-semibold"
                : "text-zinc-400 hover:text-white bg-zinc-900"
            }`}
          >
            <Globe size={13} />
            <span>Web Development</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("software_engineering")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "software_engineering"
                ? "bg-white text-black font-semibold"
                : "text-zinc-400 hover:text-white bg-zinc-900"
            }`}
          >
            <Code2 size={13} />
            <span>Software</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search client, brand, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-white/15 focus:border-white rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Billing Model Filter - Horizontal Scroll Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="font-semibold text-zinc-500 uppercase text-[10px] shrink-0 mr-1 select-none">
          Model:
        </span>
        {[
          { id: "all", label: "All" },
          { id: "monthly", label: "Monthly Retainer" },
          { id: "per_project", label: "Per Project" },
          { id: "hybrid", label: "Hybrid" },
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setSelectedBilling(type.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
              selectedBilling === type.id
                ? "bg-white text-black font-semibold"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/5"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Client Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : filteredClients.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No clients found"
          description="Create your first client record to manage retainers and deliverables."
          actionText="Add New Client"
          onAction={() => setIsClientModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const hasMonthly =
              client.billing_type === "monthly" || client.billing_type === "hybrid";

            return (
              <div
                key={client.id}
                className="p-4 sm:p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-white/20 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <CustomBadge type={client.category} size="sm" />
                    <CustomBadge type={client.billing_type} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {client.business_name || client.name}
                  </h3>
                  {client.business_name && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Contact: {client.name}
                    </p>
                  )}

                  <div className="mt-3 p-3 rounded-xl bg-black border border-white/10 space-y-1.5 text-xs">
                    {hasMonthly ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">Monthly Retainer:</span>
                          <span className="font-bold text-white">
                            {formatPKR(client.monthly_amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">Cycle Reset Day:</span>
                          <span className="font-semibold text-zinc-200">
                            {client.cycle_reset_day}th of month
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>Billing:</span>
                        <span className="text-zinc-300 font-semibold">
                          Per deliverable / post
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1.5 border-t border-white/5 text-[11px]">
                      <span className="text-zinc-400">Total Projects:</span>
                      <span className="text-zinc-200 font-medium">
                        {client.total_projects || 0} projects
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                    {client.phone && (
                      <a
                        href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        <Phone size={12} className="text-zinc-400" />
                        <span>{client.phone}</span>
                      </a>
                    )}
                    {client.email && (
                      <a
                        href={`mailto:${client.email}`}
                        className="flex items-center gap-1 hover:text-white transition-colors truncate max-w-[150px]"
                      >
                        <Mail size={12} className="text-zinc-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <Link
                    href={`/invoices/new?client_id=${client.id}`}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs font-medium flex items-center gap-1.5"
                  >
                    <FilePlus size={13} />
                    <span>Invoice</span>
                  </Link>

                  <Link
                    href={`/clients/${client.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors"
                  >
                    <span>View Profile</span>
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
