"use client";

import React, { useState, useEffect } from "react";
import { ActionPopup } from "@/components/ui/ActionPopup";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingTextarea } from "@/components/ui/FloatingTextarea";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CustomToggle } from "@/components/ui/CustomToggle";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { PostCalculator, CalculatorItem } from "@/components/projects/PostCalculator";
import { Briefcase, Palette, Globe, Code2, Layers } from "lucide-react";
import { Client, Project, ServiceCategory, PaymentStatus } from "@/lib/types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  projectToEdit?: Project | null;
  defaultClientId?: string;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  projectToEdit,
  defaultClientId,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(
    projectToEdit?.client_id || defaultClientId || ""
  );
  const [title, setTitle] = useState(projectToEdit?.title || "");
  const [category, setCategory] = useState<ServiceCategory>(
    projectToEdit?.category || "graphic_design"
  );
  const [description, setDescription] = useState(
    projectToEdit?.description || ""
  );
  const [isExtraProject, setIsExtraProject] = useState(
    projectToEdit?.is_extra_project === 1
  );
  const [dueDate, setDueDate] = useState(
    projectToEdit?.due_date ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [discount, setDiscount] = useState<number>(projectToEdit?.discount || 0);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">(
    projectToEdit?.discount_type || "fixed"
  );
  const [items, setItems] = useState<CalculatorItem[]>(
    projectToEdit?.items && projectToEdit.items.length > 0
      ? projectToEdit.items.map((i) => ({
          id: i.id,
          item_type: i.item_type,
          quantity: i.quantity,
          unit_price: i.unit_price,
          total_price: i.total_price,
          notes: i.notes || "",
        }))
      : []
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    projectToEdit?.payment_status || "unpaid"
  );
  const [paidAmount, setPaidAmount] = useState<number>(
    projectToEdit?.paid_amount || 0
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/clients");
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
          if (!clientId && data.clients?.length > 0) {
            setClientId(defaultClientId || data.clients[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen, clientId, defaultClientId]);

  // When client changes, auto-detect if client has monthly billing to suggest "Extra Project"
  const selectedClient = clients.find((c) => c.id === clientId);
  useEffect(() => {
    if (
      selectedClient &&
      (selectedClient.billing_type === "monthly" ||
        selectedClient.billing_type === "hybrid") &&
      !projectToEdit
    ) {
      setIsExtraProject(true);
    }
  }, [selectedClient, projectToEdit]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Please provide a project title.");
      return;
    }
    if (!clientId) {
      setError("Please select a client.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const url = projectToEdit
        ? `/api/projects/${projectToEdit.id}`
        : "/api/projects";
      const method = projectToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          title: title.trim(),
          category,
          description: description.trim(),
          is_extra_project: isExtraProject ? 1 : 0,
          status: projectToEdit?.status || "in_progress",
          discount: Number(discount) || 0,
          discount_type: discountType,
          payment_status: paymentStatus,
          paid_amount: Number(paidAmount) || 0,
          due_date: dueDate,
          items,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save project");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ActionPopup
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSubmit}
      title={projectToEdit ? "Edit Project & Deliverables" : "Create New Project"}
      description="Add project scope, configure post deliverables & rates, and set billing parameters."
      confirmText={projectToEdit ? "Save Project" : "Create Project"}
      icon={<Briefcase size={18} />}
      isLoading={isLoading}
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-zinc-900 border border-white/20 text-white">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <CustomSelect
            label="Client"
            value={clientId}
            onChange={(val) => setClientId(val)}
            options={clients.map((c) => ({
              value: c.id,
              label: c.business_name || c.name,
              description: `${c.billing_type} • ${c.category.replace("_", " ")}`,
            }))}
          />

          <FloatingInput
            label="Project Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer Campaign Graphics"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
          <CustomSelect
            label="Service Division"
            value={category}
            onChange={(val) => setCategory(val as ServiceCategory)}
            options={[
              {
                value: "graphic_design",
                label: "Graphic Design",
                icon: <Palette size={14} className="text-zinc-400" />,
              },
              {
                value: "web_development",
                label: "Website Development",
                icon: <Globe size={14} className="text-zinc-400" />,
              },
              {
                value: "software_engineering",
                label: "Software Engineering",
                icon: <Code2 size={14} className="text-zinc-400" />,
              },
            ]}
          />

          <CustomDatePicker
            label="Target Delivery / Due Date"
            value={dueDate}
            onChange={(val) => setDueDate(val)}
          />
        </div>

        {/* Extra Project Toggle (crucial requirement from prompt) */}
        {selectedClient &&
          (selectedClient.billing_type === "monthly" ||
            selectedClient.billing_type === "hybrid") && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10">
              <CustomToggle
                label="Extra Project (Separate from Monthly Retainer)"
                sublabel="Mark this project as an additional billable job outside their fixed monthly retainer."
                checked={isExtraProject}
                onChange={setIsExtraProject}
              />
            </div>
          )}

        <FloatingTextarea
          label="Project Scope / Brief Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        {/* POSTS & DELIVERABLES CALCULATOR */}
        <div className="pt-2">
          <PostCalculator
            items={items}
            onChangeItems={setItems}
            discount={discount}
            discountType={discountType}
            onChangeDiscount={(d, t) => {
              setDiscount(d);
              setDiscountType(t);
            }}
          />
        </div>
      </div>
    </ActionPopup>
  );
};
