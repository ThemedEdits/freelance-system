"use client";

import React, { useState } from "react";
import { ActionPopup } from "@/components/ui/ActionPopup";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingTextarea } from "@/components/ui/FloatingTextarea";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CustomNumberStepper } from "@/components/ui/CustomNumberStepper";
import { UserPlus, Palette, Globe, Code2, Calendar } from "lucide-react";
import { Client, ServiceCategory, BillingType } from "@/lib/types";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  clientToEdit?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  clientToEdit,
}) => {
  const [name, setName] = useState(clientToEdit?.name || "");
  const [businessName, setBusinessName] = useState(
    clientToEdit?.business_name || ""
  );
  const [email, setEmail] = useState(clientToEdit?.email || "");
  const [phone, setPhone] = useState(clientToEdit?.phone || "");
  const [category, setCategory] = useState<ServiceCategory>(
    clientToEdit?.category || "graphic_design"
  );
  const [billingType, setBillingType] = useState<BillingType>(
    clientToEdit?.billing_type || "monthly"
  );
  const [monthlyAmount, setMonthlyAmount] = useState<number>(
    clientToEdit?.monthly_amount || 35000
  );
  const [cycleResetDay, setCycleResetDay] = useState<number>(
    clientToEdit?.cycle_reset_day || 1
  );
  const [notes, setNotes] = useState(clientToEdit?.notes || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter client contact person or name.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const url = clientToEdit ? `/api/clients/${clientToEdit.id}` : "/api/clients";
      const method = clientToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          business_name: businessName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          category,
          billing_type: billingType,
          monthly_amount:
            billingType === "per_project" ? 0 : Number(monthlyAmount) || 0,
          cycle_reset_day: Number(cycleResetDay) || 1,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save client");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save client");
    } finally {
      setIsLoading(false);
    }
  };

  const isMonthly = billingType === "monthly" || billingType === "hybrid";

  return (
    <ActionPopup
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSubmit}
      title={clientToEdit ? "Edit Client Details" : "Add New Client"}
      description="Create a client record with specific billing model, service category, and monthly cycle reset day."
      confirmText={clientToEdit ? "Save Changes" : "Create Client"}
      icon={<UserPlus size={22} />}
      variant="info"
      isLoading={isLoading}
    >
      <div className="space-y-4 pt-2">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FloatingInput
            label="Client / Contact Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <FloatingInput
            label="Business / Brand Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FloatingInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FloatingInput
            label="Phone / WhatsApp"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Division / Service Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <CustomSelect
            label="Service Division"
            value={category}
            onChange={(val) => setCategory(val as ServiceCategory)}
            options={[
              {
                value: "graphic_design",
                label: "Graphic Design",
                description: "Social posts, branding, reels",
                icon: <Palette size={14} className="text-cyan-400" />,
              },
              {
                value: "web_development",
                label: "Website Development",
                description: "Landing pages, websites, CMS",
                icon: <Globe size={14} className="text-purple-400" />,
              },
              {
                value: "software_engineering",
                label: "Software Engineering",
                description: "Custom apps, APIs, systems",
                icon: <Code2 size={14} className="text-emerald-400" />,
              },
            ]}
          />

          <CustomSelect
            label="Billing Model"
            value={billingType}
            onChange={(val) => setBillingType(val as BillingType)}
            options={[
              {
                value: "monthly",
                label: "Monthly Retainer",
                description: "Fixed monthly salary/amount",
              },
              {
                value: "per_project",
                label: "Per Project",
                description: "Calculated by deliverables/posts",
              },
              {
                value: "hybrid",
                label: "Hybrid (Monthly + Projects)",
                description: "Retainer with separate extra projects",
              },
            ]}
          />
        </div>

        {/* Monthly Retainer fields if Monthly or Hybrid */}
        {isMonthly && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-3.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <Calendar size={14} />
              <span>Monthly Retainer & Cycle Reset Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
              <FloatingInput
                label="Monthly Retainer (PKR)"
                type="number"
                prefixText="Rs."
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(parseFloat(e.target.value) || 0)}
              />

              <div>
                <CustomNumberStepper
                  label="Cycle Reset Day (of month)"
                  value={cycleResetDay}
                  onChange={(val) => setCycleResetDay(val)}
                  min={1}
                  max={31}
                  suffix="th"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  e.g. 1st, 6th, 18th, 21st of every month
                </span>
              </div>
            </div>
          </div>
        )}

        <FloatingTextarea
          label="Internal Notes / Project Scope Details"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>
    </ActionPopup>
  );
};
