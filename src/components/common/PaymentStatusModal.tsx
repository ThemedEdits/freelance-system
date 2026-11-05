"use client";

import React, { useState } from "react";
import { ActionPopup } from "@/components/ui/ActionPopup";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { formatPKR } from "@/lib/utils";
import { CreditCard, CheckCircle2, Clock, AlertCircle, PieChart } from "lucide-react";
import { PaymentStatus } from "@/lib/types";

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entityType: "cycle" | "project";
  entityId: string;
  title: string;
  totalAmount: number;
  currentStatus: PaymentStatus;
  currentPaidAmount: number;
  dueDate?: string;
}

export const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  entityType,
  entityId,
  title,
  totalAmount,
  currentStatus,
  currentPaidAmount,
  dueDate,
}) => {
  const [status, setStatus] = useState<PaymentStatus>(currentStatus);
  const [paidAmount, setPaidAmount] = useState<number>(
    currentStatus === "paid" ? totalAmount : currentPaidAmount || 0
  );
  const [paidDate, setPaidDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStatusChange = (newStatus: PaymentStatus) => {
    setStatus(newStatus);
    if (newStatus === "paid" || newStatus === "late_paid") {
      setPaidAmount(totalAmount);
    } else if (newStatus === "unpaid") {
      setPaidAmount(0);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError("");

    try {
      const url =
        entityType === "cycle"
          ? `/api/cycles/${entityId}`
          : `/api/projects/${entityId}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_status: status,
          paid_amount: Number(paidAmount) || 0,
          paid_at:
            status === "paid" || status === "late_paid" || status === "partial"
              ? paidDate
              : null,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update payment status");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update payment status");
    } finally {
      setIsLoading(false);
    }
  };

  const remainingBalance = Math.max(0, totalAmount - (Number(paidAmount) || 0));

  return (
    <ActionPopup
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Update Payment Status"
      description={`Record or update payment receipt for ${title}. Total: ${formatPKR(totalAmount)}`}
      confirmText="Update Payment"
      icon={<CreditCard size={22} />}
      variant={
        status === "paid"
          ? "success"
          : status === "late_paid"
          ? "warning"
          : status === "unpaid"
          ? "danger"
          : "info"
      }
      isLoading={isLoading}
    >
      <div className="space-y-4 pt-2">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
            {error}
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block">Total Due Amount</span>
            <span className="text-base font-bold text-white">
              {formatPKR(totalAmount)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 block">Remaining Balance</span>
            <span
              className={`text-base font-bold ${
                remainingBalance === 0 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {formatPKR(remainingBalance)}
            </span>
          </div>
        </div>

        {/* Status Dropdown */}
        <CustomSelect
          label="Payment Status"
          value={status}
          onChange={(val) => handleStatusChange(val as PaymentStatus)}
          options={[
            {
              value: "paid",
              label: "Paid Complete",
              description: "Full amount received on time",
              icon: <CheckCircle2 size={15} className="text-emerald-400" />,
            },
            {
              value: "late_paid",
              label: "Late Paid",
              description: "Paid after cycle reset / due date",
              icon: <Clock size={15} className="text-amber-400" />,
            },
            {
              value: "partial",
              label: "Paid Partial Amount",
              description: "Partially settled, remaining balance pending",
              icon: <PieChart size={15} className="text-indigo-400" />,
            },
            {
              value: "unpaid",
              label: "Unpaid / Due",
              description: "Payment has not yet been received",
              icon: <AlertCircle size={15} className="text-rose-400" />,
            },
          ]}
        />

        {/* If Partial: Amount input */}
        {status === "partial" && (
          <FloatingInput
            label="Amount Paid So Far (PKR) *"
            type="number"
            prefixText="Rs."
            value={paidAmount}
            onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
            hint={`Remaining balance will be: ${formatPKR(remainingBalance)}`}
          />
        )}

        {/* If Paid or Late Paid or Partial: Date picker for paid_at */}
        {status !== "unpaid" && (
          <CustomDatePicker
            label="Date Payment Received"
            value={paidDate}
            onChange={(val) => setPaidDate(val)}
            showQuickPicks={true}
          />
        )}

        <FloatingInput
          label="Payment Reference / Transaction ID / Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Meezan transfer / EasyPaisa TRX #9872"
        />
      </div>
    </ActionPopup>
  );
};
