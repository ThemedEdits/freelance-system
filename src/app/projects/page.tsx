"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Palette,
  Globe,
  Code2,
  Calendar,
  Layers,
  FilePlus,
  Trash2,
  Edit2,
  ChevronRight,
  Calculator,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { PaymentStatusModal } from "@/components/common/PaymentStatusModal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActionPopup } from "@/components/ui/ActionPopup";
import { Project, ServiceCategory, PaymentStatus } from "@/lib/types";
import { formatPKR, formatDate } from "@/lib/billing";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    entityType: "cycle" | "project";
    entityId: string;
    title: string;
    totalAmount: number;
    currentStatus: any;
    currentPaidAmount: number;
  }>({
    isOpen: false,
    entityType: "project",
    entityId: "",
    title: "",
    totalAmount: 0,
    currentStatus: "unpaid",
    currentPaidAmount: 0,
  });

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      let url = "/api/projects?";
      if (selectedCategory !== "all") {
        url += `category=${selectedCategory}&`;
      }
      if (selectedStatus !== "all") {
        url += `status=${selectedStatus}&`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, selectedStatus]);

  const handleDelete = async () => {
    if (!deletingProjectId) return;
    try {
      await fetch(`/api/projects/${deletingProjectId}`, { method: "DELETE" });
      setDeletingProjectId(null);
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.client_name?.toLowerCase().includes(q) ||
      p.client_business?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <Header
        title="Projects & Deliverables"
        subtitle="Manage deliverables, line items, multi-post counts, rates and invoice readiness"
        onOpenNewProject={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
      />

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/[0.08]">
        {/* Divisions */}
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
            All Divisions
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

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search projects, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/[0.08] focus:border-cyan-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={32} />}
          title="No projects found"
          description="Create your first project to calculate post deliverable counts, set rates, and generate sleek invoices."
          actionText="Create Project"
          onAction={() => {
            setEditingProject(null);
            setIsProjectModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const totalDeliverables =
              project.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
            const remainingBalance = Math.max(
              0,
              project.total_amount - (project.paid_amount || 0)
            );

            return (
              <div
                key={project.id}
                className="p-5 sm:p-6 rounded-2xl glass-card border border-white/[0.08] hover:border-white/[0.16] transition-all space-y-4 group"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CustomBadge type={project.category} size="sm" />
                      <CustomBadge type={project.payment_status} size="sm" />
                      {project.is_extra_project === 1 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-bold uppercase tracking-wider">
                          Extra Project
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Client:{" "}
                      <Link
                        href={`/clients/${project.client_id}`}
                        className="text-cyan-400 font-semibold hover:underline"
                      >
                        {project.client_business || project.client_name}
                      </Link>
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xs text-slate-400 block">
                      Total Calculated Amount
                    </span>
                    <span className="text-xl font-black text-cyan-300">
                      {formatPKR(project.total_amount)}
                    </span>
                    {project.paid_amount > 0 && (
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Paid:{" "}
                        <strong className="text-emerald-400">
                          {formatPKR(project.paid_amount)}
                        </strong>{" "}
                        • Due:{" "}
                        <strong className="text-amber-400">
                          {formatPKR(remainingBalance)}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                {project.description && (
                  <p className="text-xs text-slate-300 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                    {project.description}
                  </p>
                )}

                {/* Post Deliverables Breakdown List */}
                {project.items && project.items.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <span>
                        Deliverable Breakdown ({totalDeliverables} total items)
                      </span>
                      <span>Rate & Line Total</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                      {project.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-xs flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-semibold text-white block">
                              {item.item_type}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {item.quantity} posts @ {formatPKR(item.unit_price)}
                            </span>
                          </div>
                          <span className="font-bold text-cyan-300">
                            {formatPKR(item.total_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Bottom Bar */}
                <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-slate-400 flex items-center gap-3">
                    {project.due_date && (
                      <span>Due: {formatDate(project.due_date)}</span>
                    )}
                    <span>•</span>
                    <span>Created: {formatDate(project.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Add / Edit Posts Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(project);
                        setIsProjectModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.08] transition-all font-semibold"
                    >
                      <Calculator size={13} className="text-cyan-400" />
                      <span>Adjust Posts / Rates</span>
                    </button>

                    {/* Payment Modal */}
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentModalData({
                          isOpen: true,
                          entityType: "project",
                          entityId: project.id,
                          title: project.title,
                          totalAmount: project.total_amount,
                          currentStatus: project.payment_status,
                          currentPaidAmount: project.paid_amount,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.08] transition-colors font-semibold"
                    >
                      Payment
                    </button>

                    {/* Generate Invoice */}
                    <Link
                      href={`/invoices/new?project_id=${project.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-md shadow-cyan-950/40 transition-all active:scale-95"
                    >
                      <FilePlus size={13} strokeWidth={2.5} />
                      <span>Invoice</span>
                    </Link>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeletingProjectId(project.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                      title="Delete project"
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

      {/* Edit / Add Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSaved={fetchProjects}
        projectToEdit={editingProject}
      />

      {/* Payment Status Modal */}
      <PaymentStatusModal
        isOpen={paymentModalData.isOpen}
        onClose={() =>
          setPaymentModalData((prev) => ({ ...prev, isOpen: false }))
        }
        onSuccess={fetchProjects}
        entityType={paymentModalData.entityType}
        entityId={paymentModalData.entityId}
        title={paymentModalData.title}
        totalAmount={paymentModalData.totalAmount}
        currentStatus={paymentModalData.currentStatus}
        currentPaidAmount={paymentModalData.currentPaidAmount}
      />

      {/* Delete Confirmation Popup */}
      <ActionPopup
        isOpen={Boolean(deletingProjectId)}
        onClose={() => setDeletingProjectId(null)}
        onConfirm={handleDelete}
        title="Delete Project?"
        description="Are you sure you want to delete this project and all its deliverable items?"
        confirmText="Delete Project"
        variant="danger"
      />
    </div>
  );
}
