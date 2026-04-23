"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useContractBalance, useDepositToContract } from "@/hooks/usePayroll";
import TxStatus from "@/components/shared/TxStatus";
import { formatEther } from "viem";

interface Props {
  contractAddress?: `0x${string}`;
}

export default function PayrollPool({ contractAddress }: Props) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const { data: rawBalance, refetch: refetchBalance } = useContractBalance(contractAddress);
  const { deposit, hash, isPending, isConfirming, isSuccess, error } = useDepositToContract();

  const balance = rawBalance ? formatEther(rawBalance as bigint) : "0";
  const balanceNum = parseFloat(balance);
  const parsedAmount = parseFloat(amount) || 0;

  // Refetch balance after successful deposit
  useEffect(() => {
    if (isSuccess) {
      setAmount("");
      const t = setTimeout(() => {
        queryClient.invalidateQueries();
        refetchBalance();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [isSuccess]);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress || !parsedAmount || parsedAmount <= 0) return;
    deposit(contractAddress, amount);
  };

  // Color the balance indicator
  const balanceColor =
    balanceNum === 0
      ? "og-badge-error"
      : balanceNum < 5
      ? "og-badge-warning"
      : "og-badge-success";

  return (
    <div className="og-card rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>💰</span> Payroll Pool
        </h2>
        <span className={`text-xs px-3 py-1 rounded-full ${balanceColor}`}>
          {balanceNum === 0 ? "Empty" : balanceNum < 5 ? "Low" : "Funded"}
        </span>
      </div>

      {/* Balance display */}
      <div className="rounded-2xl p-5 text-center"
        style={{ background: "rgba(165,64,240,0.07)", border: "1px solid rgba(165,64,240,0.2)" }}>
        <p className="text-xs text-white/40 mb-1 uppercase tracking-widest">Available Balance</p>
        <p className="text-4xl font-bold text-white">
          {parseFloat(balance).toFixed(4)}
        </p>
        <p className="og-gradient-text font-semibold text-lg mt-0.5">A0GI</p>
        {contractAddress && (
          <a
            href={`https://chainscan-galileo.0g.ai/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/30 hover:text-white/60 transition mt-2 inline-block"
          >
            View contract ↗
          </a>
        )}
      </div>

      {/* Low balance warning */}
      {balanceNum > 0 && balanceNum < 5 && (
        <div className="og-badge-warning px-4 py-3 rounded-xl text-sm">
          ⚠️ Low balance — deposit more A0GI to ensure payroll can be executed.
        </div>
      )}
      {balanceNum === 0 && (
        <div className="og-badge-error px-4 py-3 rounded-xl text-sm">
          ❌ Pool is empty — payroll will fail until funded.
        </div>
      )}

      {/* Deposit form */}
      <form onSubmit={handleDeposit} className="space-y-3">
        <label className="block text-sm text-white/50">Deposit A0GI to Pool</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10.0"
            step="0.1"
            min="0.01"
            required
            className="og-input w-full rounded-xl px-4 py-3 pr-20 text-lg font-semibold"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">
            A0GI
          </span>
        </div>

        {parsedAmount > 0 && (
          <p className="text-xs text-white/30">
            New balance after deposit:{" "}
            <span className="og-gradient-text font-semibold">
              {(balanceNum + parsedAmount).toFixed(4)} A0GI
            </span>
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || isConfirming || !parsedAmount || !contractAddress}
          className="og-btn-primary w-full py-2.5 rounded-xl font-semibold"
        >
          {isPending ? "Confirm in wallet…" : isConfirming ? "Depositing…" : "💸 Deposit to Pool"}
        </button>
      </form>

      <TxStatus hash={hash} isPending={isPending} isConfirming={isConfirming} isSuccess={isSuccess} error={error as Error} label="Deposit" />

      {/* Info */}
      <div className="text-xs text-white/25 space-y-1 pt-1 border-t border-white/[0.05]">
        <p>Funds sent here are held in your smart contract and paid out to employees on payroll execution.</p>
        <p>Unspent funds remain in the contract and are not automatically withdrawn.</p>
      </div>
    </div>
  );
}
