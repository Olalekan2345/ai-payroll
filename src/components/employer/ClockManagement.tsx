"use client";

import { useEffect } from "react";
import {
  useEmployeeList, useIsClockedIn, useWeeklyHours,
  useLastClockIn, useClockInEmployee, useClockOutEmployee,
} from "@/hooks/usePayroll";
import { getCurrentWeekNumber, appendClockEvent } from "@/lib/storage";
import StatusBadge from "@/components/shared/StatusBadge";
import TxStatus from "@/components/shared/TxStatus";
import { formatEther } from "viem";

function EmployeeClockRow({ emp }: { emp: any }) {
  const { data: isClockedIn, refetch } = useIsClockedIn(emp.wallet as `0x${string}`);
  const { data: lastClockIn } = useLastClockIn(emp.wallet as `0x${string}`);
  const { data: weeklyHours } = useWeeklyHours(emp.wallet as `0x${string}`, getCurrentWeekNumber());

  const {
    clockInEmp, isPending: inPending, isConfirming: inConfirming,
    isSuccess: inSuccess, error: inError, hash: inHash,
  } = useClockInEmployee();
  const {
    clockOutEmp, isPending: outPending, isConfirming: outConfirming,
    isSuccess: outSuccess, error: outError, hash: outHash,
  } = useClockOutEmployee();

  // After confirmed clock-in: log to 0G Storage and refetch
  useEffect(() => {
    if (inSuccess) {
      const now = Math.floor(Date.now() / 1000);
      appendClockEvent(emp.wallet, emp.name, {
        employee: emp.wallet,
        timestamp: now,
        isClockIn: true,
        weekNumber: getCurrentWeekNumber(),
      } as import("@/types").ClockEvent).then(() => refetch());
    }
  }, [inSuccess]);

  // After confirmed clock-out: log to 0G Storage and refetch
  useEffect(() => {
    if (outSuccess) {
      const now = Math.floor(Date.now() / 1000);
      appendClockEvent(emp.wallet, emp.name, {
        employee: emp.wallet,
        timestamp: now,
        isClockIn: false,
        weekNumber: getCurrentWeekNumber(),
      } as import("@/types").ClockEvent).then(() => refetch());
    }
  }, [outSuccess]);

  const hours = weeklyHours ? Number((weeklyHours as any)[1]) : 0;
  const lastIn = lastClockIn && Number(lastClockIn) > 0
    ? new Date(Number(lastClockIn) * 1000)
    : null;
  const busy = inPending || inConfirming || outPending || outConfirming;

  return (
    <div className="og-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl og-btn-primary flex items-center justify-center text-base font-bold shrink-0">
            {emp.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold">{emp.name}</p>
            <p className="text-xs text-white/30 font-mono">
              {emp.wallet.slice(0, 6)}…{emp.wallet.slice(-4)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-center">
            <p className="text-xs text-white/30 mb-1">Status</p>
            <StatusBadge
              label={isClockedIn ? "Clocked In" : "Clocked Out"}
              variant={isClockedIn ? "success" : "neutral"}
            />
          </div>
          <div className="text-center">
            <p className="text-xs text-white/30 mb-0.5">This Week</p>
            <p className="text-sm font-semibold og-gradient-text">{hours}h</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/30 mb-0.5">Rate</p>
            <p className="text-sm text-white/60">{formatEther(emp.hourlyRateWei)} A0GI/hr</p>
          </div>
          {lastIn && (
            <div className="text-center">
              <p className="text-xs text-white/30 mb-0.5">Last Clock In</p>
              <p className="text-xs text-white/50 font-mono">
                {lastIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                <span className="text-white/30 ml-1">
                  {lastIn.toLocaleDateString([], { month: "short", day: "numeric" })}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => clockInEmp(emp.wallet as `0x${string}`)}
            disabled={!!isClockedIn || busy || !emp.active}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold og-badge-success hover:bg-emerald-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            🟢 Clock In
          </button>
          <button
            onClick={() => clockOutEmp(emp.wallet as `0x${string}`)}
            disabled={!isClockedIn || busy || !emp.active}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold og-badge-error hover:bg-red-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            🔴 Clock Out
          </button>
        </div>
      </div>

      {(inHash || inPending || inError || inSuccess) && (
        <TxStatus hash={inHash} isPending={inPending} isConfirming={inConfirming}
          isSuccess={inSuccess} error={inError as Error} label={`Clock In — ${emp.name}`} />
      )}
      {(outHash || outPending || outError || outSuccess) && (
        <TxStatus hash={outHash} isPending={outPending} isConfirming={outConfirming}
          isSuccess={outSuccess} error={outError as Error} label={`Clock Out — ${emp.name}`} />
      )}
    </div>
  );
}

export default function ClockManagement() {
  const { data: employees, isLoading } = useEmployeeList();
  const list = ((employees as any[]) || []).filter((e: any) => e.active);

  if (isLoading) {
    return (
      <div className="og-card rounded-2xl p-6 animate-pulse">
        <div className="h-4 w-48 bg-white/10 rounded" />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="og-card rounded-2xl p-10 text-center">
        <p className="text-4xl mb-3">👥</p>
        <p className="text-white font-semibold mb-1">No active employees</p>
        <p className="text-white/30 text-sm">Register employees first from the Overview tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="og-card rounded-2xl px-5 py-4 flex items-center gap-3"
        style={{ background: "rgba(124,58,237,0.08)", borderColor: "rgba(139,92,246,0.25)" }}>
        <span className="text-xl">⏰</span>
        <div>
          <p className="text-white font-semibold text-sm">Clock Management</p>
          <p className="text-white/40 text-xs">
            Clock employees in and out. Events are recorded on-chain and stored on 0G Storage.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs og-badge-info px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full og-pulse" />
          {list.length} active
        </div>
      </div>

      {list.map((emp: any) => (
        <EmployeeClockRow key={emp.wallet} emp={emp} />
      ))}
    </div>
  );
}
