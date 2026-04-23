"use client";

import { useAccount } from "wagmi";
import { usePayrollRecord, useWeeklyHours } from "@/hooks/usePayroll";
import { getCurrentWeekNumber, getWeekStart, getWeekEnd } from "@/lib/storage";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatEther } from "viem";

function WeekRecord({ weekNumber, address, contractAddress }: { weekNumber: number; address: `0x${string}`; contractAddress?: `0x${string}` }) {
  const { data: record } = usePayrollRecord(address, weekNumber, contractAddress);
  const { data: hours } = useWeeklyHours(address, weekNumber, contractAddress);

  const rec = record as any;
  const hrs = hours as any;

  const weekStart = getWeekStart(weekNumber).toLocaleDateString();
  const weekEnd = getWeekEnd(weekNumber).toLocaleDateString();
  const hoursWorked = hrs ? Number(hrs[1]) : 0;
  const paid = rec?.paid || false;
  const amount = rec?.amountPaid ? formatEther(rec.amountPaid) : "0";
  const paidAt = rec?.paidAt ? new Date(Number(rec.paidAt) * 1000).toLocaleDateString() : "—";

  if (hoursWorked === 0 && !paid) return null;

  return (
    <tr>
      <td className="text-white/60 text-sm">Week {weekNumber}</td>
      <td className="text-white/40 text-xs">
        {weekStart} – {weekEnd}
      </td>
      <td className="text-white/60 text-sm">{hoursWorked}h</td>
      <td className="og-gradient-text text-sm font-medium">{paid ? amount : `~${hoursWorked}`} A0GI</td>
      <td>
        <StatusBadge label={paid ? "Paid" : "Pending"} variant={paid ? "success" : "neutral"} />
      </td>
      <td className="text-white/40 text-xs">{paid ? paidAt : "—"}</td>
    </tr>
  );
}

export default function PaymentHistory({ contractAddress }: { contractAddress?: `0x${string}` }) {
  const { address } = useAccount();
  const currentWeek = getCurrentWeekNumber();
  const weeks = Array.from({ length: 6 }, (_, i) => currentWeek - i);

  return (
    <div className="og-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>💳</span> Payment History
        </h2>
        <p className="text-xs text-white/30 mt-0.5">Payments executed every Saturday on 0G Chain</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full og-table text-sm">
          <thead>
            <tr>
              <th className="text-left">Week</th>
              <th className="text-left">Period</th>
              <th className="text-left">Hours</th>
              <th className="text-left">Amount</th>
              <th className="text-left">Status</th>
              <th className="text-left">Paid On</th>
            </tr>
          </thead>
          <tbody>
            {address && weeks.map((wk) => (
              <WeekRecord key={wk} weekNumber={wk} address={address} contractAddress={contractAddress} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 text-xs text-white/30 border-t border-white/[0.06]">
        Rate: 1 A0GI/hour · Payments sent to your wallet every Saturday
      </div>
    </div>
  );
}
