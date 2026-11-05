"use client";

import React, { useState } from "react";
import { Plus, Trash2, Calculator, Sparkles, Tag, Check } from "lucide-react";
import { CustomNumberStepper } from "@/components/ui/CustomNumberStepper";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { formatPKR } from "@/lib/utils";

export interface CalculatorItem {
  id: string;
  item_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

interface PostCalculatorProps {
  items: CalculatorItem[];
  onChangeItems: (items: CalculatorItem[]) => void;
  discount: number;
  discountType: "fixed" | "percentage";
  onChangeDiscount: (discount: number, type: "fixed" | "percentage") => void;
  currencySymbol?: string;
}

const COMMON_DELIVERABLES = [
  { label: "Multi-Slide Carousel Post", value: "Multi-Slide Carousel Post", defaultPrice: 3500 },
  { label: "Single Static Feed Post", value: "Single Static Feed Post", defaultPrice: 1800 },
  { label: "Animated Reel / Motion Graphic", value: "Animated Reel / Motion Graphic", defaultPrice: 6000 },
  { label: "Story Post / Pack", value: "Story Post / Pack", defaultPrice: 1200 },
  { label: "Banner / Header Graphic", value: "Banner / Header Graphic", defaultPrice: 4000 },
  { label: "Logo & Brand Mark", value: "Logo & Brand Mark", defaultPrice: 15000 },
  { label: "Landing Page / UI Screen", value: "Landing Page / UI Screen", defaultPrice: 18000 },
  { label: "Feature / Backend API", value: "Feature / Backend API", defaultPrice: 35000 },
  { label: "Custom Deliverable", value: "Custom Deliverable", defaultPrice: 2500 },
];

export const PostCalculator: React.FC<PostCalculatorProps> = ({
  items,
  onChangeItems,
  discount,
  discountType,
  onChangeDiscount,
  currencySymbol = "Rs.",
}) => {
  const [selectedPreset, setSelectedPreset] = useState("");

  const handleAddItem = (presetType?: string, defaultPrice?: number) => {
    const newItem: CalculatorItem = {
      id: "item-" + Math.random().toString(36).substring(2, 9),
      item_type: presetType || "Single Static Feed Post",
      quantity: 1,
      unit_price: defaultPrice !== undefined ? defaultPrice : 2000,
      total_price: (defaultPrice !== undefined ? defaultPrice : 2000) * 1,
      notes: "",
    };
    onChangeItems([...items, newItem]);
  };

  const handleUpdateItem = (
    id: string,
    field: keyof CalculatorItem,
    value: any
  ) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const next = { ...item, [field]: value };
        if (field === "quantity" || field === "unit_price") {
          const qty = field === "quantity" ? Number(value) : item.quantity;
          const price = field === "unit_price" ? Number(value) : item.unit_price;
          next.total_price = Math.max(0, qty) * Math.max(0, price);
        }
        return next;
      }
      return item;
    });
    onChangeItems(updated);
  };

  const handleRemoveItem = (id: string) => {
    onChangeItems(items.filter((item) => item.id !== id));
  };

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + (curr.total_price || 0), 0);
  const discountAmount =
    discountType === "percentage"
      ? (subtotal * Math.min(100, Math.max(0, discount))) / 100
      : Math.min(subtotal, Math.max(0, discount));
  const grandTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Calculator size={18} className="text-cyan-400" />
            <span>Posts & Deliverables Calculator</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Track and calculate project totals based on post types, quantities, and per-post rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick preset selector */}
          <div className="w-56 hidden sm:block">
            <CustomSelect
              placeholder="Add post type..."
              value={selectedPreset}
              onChange={(val) => {
                const found = COMMON_DELIVERABLES.find((d) => d.value === val);
                if (found) {
                  handleAddItem(found.value, found.defaultPrice);
                  setSelectedPreset("");
                }
              }}
              options={COMMON_DELIVERABLES.map((d) => ({
                value: d.value,
                label: d.label,
                description: `Default: ${formatPKR(d.defaultPrice)}`,
              }))}
            />
          </div>

          <button
            type="button"
            onClick={() => handleAddItem()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
          >
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.08]">
          <p className="text-sm text-slate-400">
            No posts or deliverables added yet.
          </p>
          <button
            type="button"
            onClick={() => handleAddItem("Multi-Slide Carousel Post", 3500)}
            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 transition-colors"
          >
            <Plus size={13} />
            <span>Add First Deliverable</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.07] hover:border-white/[0.12] transition-all grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center"
            >
              {/* Deliverable Type & Notes */}
              <div className="md:col-span-5 space-y-2">
                <FloatingInput
                  label={`Post Type #${idx + 1}`}
                  value={item.item_type}
                  onChange={(e) =>
                    handleUpdateItem(item.id, "item_type", e.target.value)
                  }
                  placeholder="e.g. Carousel Post, Reel"
                />
              </div>

              {/* Quantity Stepper */}
              <div className="md:col-span-3">
                <CustomNumberStepper
                  label="Number of Posts"
                  value={item.quantity}
                  onChange={(val) => handleUpdateItem(item.id, "quantity", val)}
                  min={1}
                  suffix="posts"
                />
              </div>

              {/* Price Per Post */}
              <div className="md:col-span-2">
                <FloatingInput
                  label="Price / Post"
                  type="number"
                  prefixText={currencySymbol}
                  value={item.unit_price}
                  onChange={(e) =>
                    handleUpdateItem(
                      item.id,
                      "unit_price",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              {/* Line Total & Delete */}
              <div className="md:col-span-2 flex items-center justify-between gap-2 pt-2 md:pt-0">
                <div className="text-right flex-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Total
                  </span>
                  <span className="text-sm font-bold text-cyan-300">
                    {formatPKR(item.total_price)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label="Remove item"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totals & Discounts Breakdown */}
      <div className="p-5 rounded-2xl glass-card border border-white/[0.08] space-y-3.5 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Tag size={16} className="text-cyan-400" />
            <span className="text-sm font-medium text-slate-300">
              Apply Project Discount
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-slate-900 border border-white/[0.08] p-1">
              <button
                type="button"
                onClick={() => onChangeDiscount(discount, "fixed")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  discountType === "fixed"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Fixed ({currencySymbol})
              </button>
              <button
                type="button"
                onClick={() => onChangeDiscount(discount, "percentage")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  discountType === "percentage"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Percentage (%)
              </button>
            </div>

            <div className="w-28">
              <FloatingInput
                label={discountType === "fixed" ? "Discount (Rs)" : "Discount (%)"}
                type="number"
                value={discount}
                onChange={(e) =>
                  onChangeDiscount(parseFloat(e.target.value) || 0, discountType)
                }
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.06] space-y-1.5 text-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} deliverables)</span>
            <span className="font-semibold text-slate-200">{formatPKR(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <span>
                Discount applied{" "}
                {discountType === "percentage" ? `(${discount}%)` : ""}
              </span>
              <span>- {formatPKR(discountAmount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-base font-bold text-white pt-2 border-t border-white/[0.08]">
            <span>Grand Total</span>
            <span className="text-lg text-cyan-400">{formatPKR(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
