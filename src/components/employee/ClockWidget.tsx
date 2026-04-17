"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useClockIn, useClockOut, useIsClockedIn } from "@/hooks/usePayroll";
import { appendClockEvent } from "@/lib/storage";
import { getCurrentWeekNumber } from "@/lib/storage";
import TxStatus from "@/components/shared/TxStatus";

export default function ClockWidget({ employeeName }: { employeeName: string }) {
  const { address } = useAccount();
  const { data: isClockedIn, refetch } = useIsClockedIn(address);
  const { clockIn, isPending: inPending, isConfirming: inConfirming, isSuccess: inSuccess, hash: inHash, error: inError } = useClockIn();
  const { clockOut, isPending: outPending, isConfirming: outConfirming, isSuccess: outSuccess, hash: outHash, error: outError } = useClockOut();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (inSuccess && address) {
      const now = Math.floor(Date.now() / 1000);
      appendClockEvent(address, employeeName, {
        employee: address,
        timestamp: now,
        isClockIn: true,
        weekNumber: getCurrentWeekNumber(),
      } as import("@/types").ClockEvent).then(() => refetch());
    }
  }, [inSuccess, address, employeeName, refetch]);

  useEffect(() => {
    if (outSuccess && address) {
      const now = Math.floor(Date.now() / 1000);
      appendClockEvent(address, employeeName, {
        employee: address,
        timestamp: now,
        isClockIn: false,
        weekNumber: getCurrentWeekNumber(),
      } as import("@/types").ClockEvent).then(() => refetch());
    }
  }, [outSuccess, address, employeeName, refetch]);

  const utcHour = currentTime.getUTCHours();
  const isWorkHours = utcHour >= 9 && utcHour < 17;
  const isWeekday = currentTime.getUTCDay() >= 1 && currentTime.getUTCDay() <= 5;
  const canWork = isWorkHours && isWeekday;

  const timeStr = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="og-card rounded-2xl p-6">
      {/* Clock Display */}
      <div className="text-center mb-6">
        <p className="text-white/40 text-sm mb-1">{dateStr}</p>
        <p className="text-5xl font-mono font-bold text-white tabular-nums">{timeStr}</p>
        <p className="text-xs text-white/30 mt-1">UTC Time</p>
      </div>

      {/* Status */}
      <div className="mb-6 flex items-center justify-center">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isClockedIn ? "og-badge-success" : "og-badge-neutral"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isClockedIn ? "bg-emerald-400 og-pulse" : "bg-white/30"}`} />
          {isClockedIn ? "Clocked In — Working" : "Clocked Out"}
        </div>
      </div>

      {/* Out of hours warning */}
      {!canWork && (
        <div className="mb-4 p-3 og-badge-warning rounded-xl text-center text-xs">
          {!isWeekday ? "⏰ Weekends are not payable" : "⏰ Outside work hours (9 AM – 5 PM UTC)"}
          <br />
          <span className="text-white/30 mt-0.5 block">Clock-in/out is recorded, but only Mon–Fri 9–5 hours count.</span>
        </div>
      )}

      {/* Clock Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={clockIn}
          disabled={!!isClockedIn || inPending || inConfirming}
          className="flex flex-col items-center gap-2 py-5 rounded-xl og-badge-success hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
        >
          <span className="text-2xl">🟢</span>
          <span className="text-sm">{inPending || inConfirming ? "Processing…" : "Clock In"}</span>
        </button>
        <button
          onClick={clockOut}
          disabled={!isClockedIn || outPending || outConfirming}
          className="flex flex-col items-center gap-2 py-5 rounded-xl og-badge-error hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
        >
          <span className="text-2xl">🔴</span>
          <span className="text-sm">{outPending || outConfirming ? "Processing…" : "Clock Out"}</span>
        </button>
      </div>

      <TxStatus hash={inHash} isPending={inPending} isConfirming={inConfirming} isSuccess={inSuccess} error={inError as Error} label="Clock In" />
      <TxStatus hash={outHash} isPending={outPending} isConfirming={outConfirming} isSuccess={outSuccess} error={outError as Error} label="Clock Out" />

      <div className="mt-4 p-3 og-badge-info rounded-xl text-xs">
        📅 Work schedule: <strong>Mon–Fri, 9:00 AM – 5:00 PM UTC</strong>
        <br />
        Max payable: <strong>8h/day · 1 A0GI/hour</strong>
      </div>
    </div>
  );
}
