"use client";

import React, { useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
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
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Posts & Deliverables Scope
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Add deliverables, quantities, and rates to calculate project amounts.
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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors"
          >
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-zinc-950/40 border border-dashed border-white/10">
          <p className="text-xs text-zinc-400">
            No posts or deliverables added yet.
          </p>
          <button
            type="button"
            onClick={() => handleAddItem("Multi-Slide Carousel Post", 3500)}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
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
              className="p-4 rounded-xl bg-zinc-950/80 border border-white/10 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Deliverable #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label="Remove item"
                  className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                {/* Deliverable Type */}
                <div className="sm:col-span-5">
                  <FloatingInput
                    label="Post / Asset Name"
                    value={item.item_type}
                    onChange={(e) =>
                      handleUpdateItem(item.id, "item_type", e.target.value)
                    }
                    placeholder="e.g. Carousel Post"
                  />
                </div>

                {/* Quantity Stepper */}
                <div className="sm:col-span-3">
                  <CustomNumberStepper
                    label="Number of Posts"
                    value={item.quantity}
                    onChange={(val) => handleUpdateItem(item.id, "quantity", val)}
                    min={1}
                    suffix="posts"
                  />
                </div>

                {/* Price Per Post */}
                <div className="sm:col-span-4">
                  <FloatingInput
                    label="Price per Post"
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
              </div>

              {/* Deliverable Total */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <span className="text-zinc-500">
                  {item.quantity} × {formatPKR(item.unit_price)}
                </span>
                <span className="font-bold text-white text-sm">
                  {formatPKR(item.total_price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totals & Discounts Section */}
      <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/10 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-300">
              Apply Project Discount
            </span>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex rounded-xl bg-black border border-white/15 p-1 h-11 items-center">
              <button
                type="button"
                onClick={() => onChangeDiscount(discount, "fixed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  discountType === "fixed"
                    ? "bg-white text-black font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Fixed ({currencySymbol})
              </button>
              <button
                type="button"
                onClick={() => onChangeDiscount(discount, "percentage")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  discountType === "percentage"
                    ? "bg-white text-black font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Percent (%)
              </button>
            </div>

            <div className="w-32">
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

        <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} deliverables)</span>
            <span className="font-semibold text-zinc-200">{formatPKR(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-zinc-300">
              <span>
                Discount applied{" "}
                {discountType === "percentage" ? `(${discount}%)` : ""}
              </span>
              <span>- {formatPKR(discountAmount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
            <span>Grand Total</span>
            <span className="text-base text-white">{formatPKR(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
