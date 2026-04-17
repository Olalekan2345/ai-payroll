"use client";

import { useEmployeeList, useWeeklyHours } from "@/hooks/usePayroll";
import { getWeekNumber } from "@/lib/storage";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatEther } from "viem";

function EmployeeRow({ emp }: { emp: any }) {
  const weekNumber = getWeekNumber(new Date());
  const { data: weeklyHours } = useWeeklyHours(emp.wallet as `0x${string}`, weekNumber);
  const hours = weeklyHours ? Number(weeklyHours[1]) : 0;

  return (
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
      <td className="text-white/60 text-sm">
        {formatEther(emp.hourlyRateWei)} A0GI/hr
      </td>
      <td className="text-white/60 text-sm">
        {hours}h this week
      </td>
      <td className="text-xs text-white/30">
        {new Date(Number(emp.registeredAt) * 1000).toLocaleDateString()}
      </td>
      <td>
        <a
          href={`https://chainscan-galileo.0g.ai/address/${emp.wallet}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 text-xs transition"
        >
          View ↗
        </a>
      </td>
    </tr>
  );
}

export default function EmployeeTable({ refresh }: { refresh?: number }) {
  const { data: employees, isLoading, refetch } = useEmployeeList();

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
    <div className="og-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06]">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>👥</span> All Employees
          <span className="ml-2 text-sm font-normal text-white/30">({list.length} total)</span>
        </h2>
        <button
          onClick={() => refetch()}
          className="og-btn-ghost text-xs px-3 py-1.5 rounded-lg"
        >
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
              </tr>
            </thead>
            <tbody>
              {list.map((emp: any) => (
                <EmployeeRow key={emp.wallet} emp={emp} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
