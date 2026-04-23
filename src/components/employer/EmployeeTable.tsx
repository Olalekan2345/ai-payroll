"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEmployeeList, useWeeklyHours, useRemoveEmployee } from "@/hooks/usePayroll";
import { getWeekNumber } from "@/lib/storage";
import StatusBadge from "@/components/shared/StatusBadge";
import UpdateSalaryModal from "@/components/employer/UpdateSalaryModal";
import TxStatus from "@/components/shared/TxStatus";
import { formatEther } from "viem";

function EmployeeRow({
  emp,
  onEditRate,
  contractAddress,
  onRemoved,
}: {
  emp: any;
  onEditRate: (emp: any) => void;
  contractAddress?: `0x${string}`;
  onRemoved: () => void;
}) {
  const queryClient = useQueryClient();
  const weekNumber = getWeekNumber(new Date());
  const { data: weeklyHours } = useWeeklyHours(emp.wallet as `0x${string}`, weekNumber, contractAddress);
  const hours = weeklyHours ? Number(weeklyHours[1]) : 0;

  const { removeEmployee, isPending, isConfirming, isSuccess, error, hash } = useRemoveEmployee(contractAddress);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(() => {
      queryClient.invalidateQueries();
      onRemoved();
    }, 1000);
    return () => clearTimeout(t);
  }, [isSuccess]);

  return (
    <>
      <tr>
        <td>
          <div>
            <p className="text-white font-medium">{emp.name}</p>
            <p className="text-xs text-white/30 font-mono">
              {emp.wallet.slice(0, 6)}…{emp.wallet.slice(-4)}
            </p>
          </div>
        </td>
        <td>
          <StatusBadge label={emp.active ? "Active" : "Inactive"} variant={emp.active ? "success" : "neutral"} />
        </td>
        <td>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">{formatEther(emp.hourlyRateWei)} A0GI/hr</span>
            <button
              onClick={() => onEditRate(emp)}
              title="Update salary rate"
              className="og-btn-ghost text-xs px-2 py-0.5 rounded-lg opacity-60 hover:opacity-100"
            >
              ✏️
            </button>
          </div>
        </td>
        <td className="text-white/60 text-sm">{hours}h this week</td>
        <td className="text-xs text-white/30">
          {new Date(Number(emp.registeredAt) * 1000).toLocaleDateString()}
        </td>
        <td>
          <a
            href={`https://chainscan-galileo.0g.ai/address/${emp.wallet}`}
            target="_blank"
            rel="noopener noreferrer"
            className="og-gradient-text text-xs transition hover:opacity-80"
          >
            View ↗
          </a>
        </td>
        <td>
          {!confirmOpen ? (
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={isPending || isConfirming || isSuccess}
              title="Remove employee"
              className="text-xs px-2.5 py-1 rounded-lg og-badge-error hover:bg-red-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              {isSuccess ? "✓ Removed" : isPending || isConfirming ? "⏳" : "Remove"}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white/40">Sure?</span>
              <button
                onClick={() => {
                  removeEmployee(emp.wallet as `0x${string}`);
                  setConfirmOpen(false);
                }}
                className="text-xs px-2 py-0.5 rounded og-badge-error hover:bg-red-500/30 transition"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                className="text-xs px-2 py-0.5 rounded og-badge-neutral hover:bg-white/10 transition"
              >
                No
              </button>
            </div>
          )}
        </td>
      </tr>

      {/* Inline TX status row */}
      {(isPending || isConfirming || error) && (
        <tr>
          <td colSpan={7} className="py-0 px-4 pb-2">
            <TxStatus
              hash={hash}
              isPending={isPending}
              isConfirming={isConfirming}
              isSuccess={false}
              error={error as Error}
              label={`Remove ${emp.name}`}
            />
          </td>
        </tr>
      )}
    </>
  );
}

export default function EmployeeTable({ refresh, contractAddress }: { refresh?: number; contractAddress?: `0x${string}` }) {
  const { data: employees, isLoading, refetch } = useEmployeeList(contractAddress);
  const [editingEmp, setEditingEmp] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="og-card rounded-2xl p-6">
        <div className="animate-pulse flex gap-3 items-center">
          <div className="h-4 w-4 bg-white/10 rounded-full" />
          <div className="h-4 w-40 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  const list = (employees as any[]) || [];

  return (
    <>
      <div className="og-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>👥</span> All Employees
            <span className="ml-2 text-sm font-normal text-white/30">({list.length} total)</span>
          </h2>
          <button onClick={() => refetch()} className="og-btn-ghost text-xs px-3 py-1.5 rounded-lg">
            Refresh
          </button>
        </div>

        {list.length === 0 ? (
          <div className="px-6 py-6 text-white/30 text-sm">No employees registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full og-table text-sm">
              <thead>
                <tr>
                  <th className="text-left">Employee</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Rate</th>
                  <th className="text-left">This Week</th>
                  <th className="text-left">Joined</th>
                  <th className="text-left">Explorer</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((emp: any) => (
                  <EmployeeRow
                    key={emp.wallet}
                    emp={emp}
                    onEditRate={setEditingEmp}
                    contractAddress={contractAddress}
                    onRemoved={() => refetch()}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingEmp && (
        <UpdateSalaryModal
          employee={editingEmp}
          onClose={() => setEditingEmp(null)}
          onSuccess={() => { refetch(); setEditingEmp(null); }}
          contractAddress={contractAddress}
        />
      )}
    </>
  );
}
