"use client";

import { useState, useEffect } from "react";
import { useRegisterEmployee } from "@/hooks/usePayroll";
import { getAttendanceStorageKey } from "@/lib/storage";
import TxStatus from "@/components/shared/TxStatus";
import { parseEther } from "viem";

export default function RegisterEmployee({ onSuccess, contractAddress }: { onSuccess?: () => void; contractAddress?: `0x${string}` }) {
  const [wallet, setWallet] = useState("");
  const [name, setName] = useState("");
  const [rate, setRate] = useState("1");
  const { register, isPending, isConfirming, isSuccess, error } = useRegisterEmployee(contractAddress);

  useEffect(() => {
    if (isSuccess) {
      setWallet("");
      setName("");
      setRate("1");
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRate = parseFloat(rate);
    if (!wallet || !name || !parsedRate || parsedRate <= 0) return;
    const storageKey = getAttendanceStorageKey(wallet);
    register(wallet as `0x${string}`, name, storageKey, parseEther(rate));
  };

  const parsedRate = parseFloat(rate) || 0;

  return (
    <div className="og-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <span>➕</span> Register Employee
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/50 mb-1.5">Employee Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alice Johnson"
            required
            className="og-input w-full rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-1.5">Wallet Address</label>
          <input
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="0x..."
            required
            className="og-input w-full rounded-xl px-4 py-2.5 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-1.5">Hourly Rate (A0GI/hr)</label>
          <div className="relative">
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="1.0"
              step="0.1"
              min="0.01"
              required
              className="og-input w-full rounded-xl px-4 py-2.5 pr-20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">
              A0GI/hr
            </span>
          </div>
          {parsedRate > 0 && (
            <p className="text-xs text-white/30 mt-1.5">
              Est. weekly max: <span className="og-gradient-text font-semibold">{(parsedRate * 40).toFixed(2)} A0GI</span>
              <span className="text-white/20 ml-1">(40 hrs)</span>
            </p>
          )}
        </div>

        <div className="og-badge-info px-4 py-3 rounded-xl text-sm">
          Schedule: <strong>Mon–Fri, 9 AM – 5 PM UTC</strong> · Max <strong>8 hrs/day</strong>
        </div>
        <button
          type="submit"
          disabled={isPending || isConfirming || !parsedRate || parsedRate <= 0}
          className="og-btn-primary w-full py-2.5 rounded-xl font-semibold"
        >
          {isPending || isConfirming ? "Processing…" : "Register Employee"}
        </button>
      </form>
      <TxStatus
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error as Error}
        label="Registration"
      />
    </div>
  );
}
