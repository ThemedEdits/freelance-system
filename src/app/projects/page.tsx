"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Palette,
  Globe,
  Code2,
  FilePlus,
  Trash2,
  Calculator,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { PaymentStatusModal } from "@/components/common/PaymentStatusModal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActionPopup } from "@/components/ui/ActionPopup";
import { Project } from "@/lib/types";
import { formatPKR, formatDate } from "@/lib/utils";

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
    <div className="space-y-6 pb-12">
      <Header
        title="Projects & Deliverables"
        subtitle="Manage deliverables, line items, multi-post counts, rates and invoice readiness"
        onOpenNewProject={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
      />

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-zinc-950 border border-white/10">
        {/* Divisions */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-white text-black font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            All Divisions
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("graphic_design")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "graphic_design"
                ? "bg-white text-black font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Palette size={13} />
            <span>Graphic Design</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("web_development")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "web_development"
                ? "bg-white text-black font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Globe size={13} />
            <span>Web Development</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("software_engineering")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "software_engineering"
                ? "bg-white text-black font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Code2 size={13} />
            <span>Software Clients</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search projects, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-white/10 focus:border-white/30 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="No projects found"
          description="Create your first project to calculate post deliverable counts, set rates, and generate sleek invoices."
          actionText="Create Project"
          onAction={() => {
            setEditingProject(null);
            setIsProjectModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-3">
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
                className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-white/10 hover:border-white/20 transition-colors space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <CustomBadge type={project.category} size="sm" />
                      <CustomBadge type={project.payment_status} size="sm" />
                      {project.is_extra_project === 1 && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/10 font-medium">
                          Extra Project
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {project.title}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Client:{" "}
                      <Link
                        href={`/clients/${project.client_id}`}
                        className="text-zinc-300 hover:text-white underline"
                      >
                        {project.client_business || project.client_name}
                      </Link>
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-[11px] text-zinc-400 block">
                      Total Calculated
                    </span>
                    <span className="text-base sm:text-lg font-bold text-white">
                      {formatPKR(project.total_amount)}
                    </span>
                    {project.paid_amount > 0 && (
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        Paid: <span className="text-white">{formatPKR(project.paid_amount)}</span> • Due: <span className="text-white">{formatPKR(remainingBalance)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {project.description && (
                  <p className="text-xs text-zinc-400 bg-black p-2.5 rounded-lg border border-white/5">
                    {project.description}
                  </p>
                )}

                {/* Post Deliverables Breakdown List */}
                {project.items && project.items.length > 0 && (
                  <div className="p-3 rounded-lg bg-black border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      <span>
                        Deliverable Breakdown ({totalDeliverables} items)
                      </span>
                      <span>Rate & Line Total</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                      {project.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-2 rounded bg-zinc-950 border border-white/5 text-xs flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-white block truncate">
                              {item.item_type}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {item.quantity} posts @ {formatPKR(item.unit_price)}
                            </span>
                          </div>
                          <span className="font-semibold text-white shrink-0">
                            {formatPKR(item.total_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Bottom Bar */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-zinc-400 flex items-center gap-2 text-[11px]">
                    {project.due_date && (
                      <span>Due: {formatDate(project.due_date)}</span>
                    )}
                    <span>•</span>
                    <span>Created: {formatDate(project.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Add / Edit Posts Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(project);
                        setIsProjectModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-medium transition-colors"
                    >
                      <Calculator size={13} className="text-zinc-400" />
                      <span>Posts / Rates</span>
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
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-medium transition-colors"
                    >
                      Payment
                    </button>

                    {/* Generate Invoice */}
                    <Link
                      href={`/invoices/new?project_id=${project.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors shadow-sm"
                    >
                      <FilePlus size={13} />
                      <span>Invoice</span>
                    </Link>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeletingProjectId(project.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Modal */}
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
        entityType="project"
        entityId={paymentModalData.entityId}
        title={paymentModalData.title}
        totalAmount={paymentModalData.totalAmount}
        currentStatus={paymentModalData.currentStatus}
        currentPaidAmount={paymentModalData.currentPaidAmount}
      />

      {/* Delete Confirmation Modal */}
      <ActionPopup
        isOpen={deletingProjectId !== null}
        onClose={() => setDeletingProjectId(null)}
        onConfirm={handleDelete}
        title="Delete Project?"
        description="Are you sure you want to permanently delete this project and all its post line items? This cannot be undone."
        confirmText="Delete Project"
        variant="danger"
        icon={<Trash2 size={18} />}
      />
    </div>
  );
}
