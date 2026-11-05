"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Settings,
  Building2,
  CreditCard,
  Smartphone,
  Save,
  Check,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { Header } from "@/components/layout/Header";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { CompanySettings } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSuccessMessage("Company settings & bank details saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof CompanySettings, val: string) => {
    if (settings) {
      setSettings({ ...settings, [field]: val });
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      <Header
        title="Settings & Firm Identity"
        subtitle="Manage company socials, bank accounts, EasyPaisa details, and invoice footer metadata"
      />

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Company Identity */}
        <div className="p-6 rounded-2xl glass-card border border-white/[0.08] space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-white/[0.08]">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border border-white/[0.1] p-1.5 shrink-0 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.15)]">
              <Image
                src="/logo.png"
                alt="Themed Edits"
                width={64}
                height={64}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Company Brand & Social Handles
              </h2>
              <p className="text-xs text-slate-400">
                These details appear on fixed invoice headers, footers, and client notifications.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingInput
              label="Company / Firm Name"
              value={settings.company_name}
              onChange={(e) => updateField("company_name", e.target.value)}
            />

            <FloatingInput
              label="Tagline / Services Line"
              value={settings.tagline}
              onChange={(e) => updateField("tagline", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FloatingInput
              label="Official Email"
              type="email"
              icon={<Mail size={14} />}
              value={settings.email}
              onChange={(e) => updateField("email", e.target.value)}
            />

            <FloatingInput
              label="WhatsApp / Phone"
              icon={<Phone size={14} />}
              value={settings.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
            />

            <FloatingInput
              label="Instagram Handle"
              icon={<InstagramIcon size={14} />}
              value={settings.instagram}
              onChange={(e) => updateField("instagram", e.target.value)}
            />
          </div>
        </div>

        {/* Bank & EasyPaisa Accounts */}
        <div className="p-6 rounded-2xl glass-card border border-white/[0.08] space-y-5">
          <div className="pb-3 border-b border-white/[0.08]">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard size={18} className="text-cyan-400" />
              <span>Bank & EasyPaisa Accounts (For Invoices)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Clients won&apos;t have to ask repeatedly; these appear neatly organized on every generated invoice.
            </p>
          </div>

          {/* Bank Transfer Details */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
              Primary Bank Transfer Account
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FloatingInput
                label="Bank Name"
                value={settings.bank_name}
                onChange={(e) => updateField("bank_name", e.target.value)}
              />

              <FloatingInput
                label="Account Title"
                value={settings.account_title}
                onChange={(e) => updateField("account_title", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FloatingInput
                label="Account Number"
                value={settings.account_number}
                onChange={(e) => updateField("account_number", e.target.value)}
              />

              <FloatingInput
                label="IBAN"
                value={settings.iban}
                onChange={(e) => updateField("iban", e.target.value)}
              />
            </div>
          </div>

          {/* EasyPaisa Details */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block flex items-center gap-1.5">
              <Smartphone size={15} />
              <span>Easypaisa Mobile Wallet Account</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FloatingInput
                label="Easypaisa Account Title"
                value={settings.easypaisa_title}
                onChange={(e) => updateField("easypaisa_title", e.target.value)}
              />

              <FloatingInput
                label="Easypaisa Mobile Number"
                value={settings.easypaisa_number}
                onChange={(e) => updateField("easypaisa_number", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Currency & Preferences */}
        <div className="p-6 rounded-2xl glass-card border border-white/[0.08] space-y-4">
          <h2 className="text-base font-bold text-white">Currency Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingInput
              label="Currency Code"
              value={settings.currency}
              onChange={(e) => updateField("currency", e.target.value)}
            />
            <FloatingInput
              label="Currency Symbol"
              value={settings.currency_symbol}
              onChange={(e) => updateField("currency_symbol", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-950/40 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{isSaving ? "Saving Settings..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
