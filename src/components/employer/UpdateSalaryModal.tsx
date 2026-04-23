"use client";

import { useState, useEffect } from "react";
import { useUpdateSalary } from "@/hooks/usePayroll";
import TxStatus from "@/components/shared/TxStatus";
import { formatEther, parseEther } from "viem";

interface Props {
  employee: { wallet: string; name: string; hourlyRateWei: bigint };
  onClose: () => void;
  onSuccess: () => void;
  contractAddress?: `0x${string}`;
}

export default function UpdateSalaryModal({ employee, onClose, onSuccess, contractAddress }: Props) {
  const currentRate = parseFloat(formatEther(employee.hourlyRateWei));
  const [rate, setRate] = useState(currentRate.toString());
  const { updateRate, isPending, isConfirming, isSuccess, error, hash } = useUpdateSalary(contractAddress);

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    }
  }, [isSuccess, onSuccess, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(rate);
    if (!val || val <= 0) return;
    updateRate(employee.wallet as `0x${string}`, parseEther(rate));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(6,0,14,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="og-card rounded-2xl p-6 w-full max-w-md relative"
        style={{ background: "rgba(20,0,45,0.95)", border: "1px solid rgba(139,92,246,0.35)", boxShadow: "0 0 60px rgba(124,58,237,0.25)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Update Salary Rate</h2>
            <p className="text-sm text-white/40 mt-0.5 font-mono">
              {employee.name} · {employee.wallet.slice(0, 6)}…{employee.wallet.slice(-4)}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg og-btn-ghost flex items-center justify-center text-white/50 hover:text-white transition">
            ✕
          </button>
        </div>

        {/* Current rate */}
        <div className="rounded-xl p-3 mb-5 flex items-center justify-between"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <span className="text-sm text-white/40">Current rate</span>
          <span className="og-gradient-text font-bold text-lg">{currentRate} A0GI / hr</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/50 mb-1.5">New Hourly Rate (A0GI)</label>
            <div className="relative">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                step="0.1"
                min="0.1"
                required
                className="og-input w-full rounded-xl px-4 py-3 pr-20 text-lg font-semibold"
                placeholder="1.0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">A0GI/hr</span>
            </div>
            {parseFloat(rate) !== currentRate && parseFloat(rate) > 0 && (
              <p className="text-xs text-white/30 mt-1.5">
                Change: {currentRate} → <span className="og-gradient-text font-semibold">{rate} A0GI/hr</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button type="button" onClick={onClose} className="og-btn-ghost py-2.5 rounded-xl font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isConfirming || parseFloat(rate) === currentRate || !parseFloat(rate)}
              className="og-btn-primary py-2.5 rounded-xl font-semibold"
            >
              {isPending || isConfirming ? "Updating…" : "Update Rate"}
            </button>
          </div>
        </form>

        <TxStatus hash={hash} isPending={isPending} isConfirming={isConfirming} isSuccess={isSuccess} error={error as Error} label="Salary update" />
      </div>
    </div>
  );
}
