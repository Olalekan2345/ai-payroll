"use client";

import { useState, useEffect } from "react";
import { useRegisterEmployee } from "@/hooks/usePayroll";
import { getAttendanceStorageKey } from "@/lib/storage";
import TxStatus from "@/components/shared/TxStatus";

export default function RegisterEmployee({ onSuccess }: { onSuccess?: () => void }) {
  const [wallet, setWallet] = useState("");
  const [name, setName] = useState("");
  const { register, isPending, isConfirming, isSuccess, error } = useRegisterEmployee();

  useEffect(() => {
    if (isSuccess) {
      setWallet("");
      setName("");
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !name) return;
    const storageKey = getAttendanceStorageKey(wallet);
    register(wallet as `0x${string}`, name, storageKey);
  };

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
        <div className="og-badge-info px-4 py-3 rounded-xl text-sm">
          Pay rate: <strong>1 A0GI/hour</strong> · Schedule: <strong>Mon–Fri, 9 AM – 5 PM UTC</strong>
        </div>
        <button
          type="submit"
          disabled={isPending || isConfirming}
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
