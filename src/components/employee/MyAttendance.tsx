"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useWeeklyHours } from "@/hooks/usePayroll";
import { getAttendanceLocal, getCurrentWeekNumber, getWeekStart, getWeekEnd, formatHours } from "@/lib/storage";
import { StorageAttendance, ClockEvent } from "@/types";
import StatusBadge from "@/components/shared/StatusBadge";
import StatCard from "@/components/shared/StatCard";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function MyAttendance({ contractAddress }: { contractAddress?: `0x${string}` }) {
  const { address } = useAccount();
  const [attendance, setAttendance] = useState<StorageAttendance | null>(null);
  const weekNumber = getCurrentWeekNumber();
  const { data: weeklyHours } = useWeeklyHours(address, weekNumber, contractAddress);

  useEffect(() => {
    if (!address) return;
    const load = () => setAttendance(getAttendanceLocal(address));
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [address]);

  const weekStart = getWeekStart(weekNumber).getTime() / 1000;
  const weekEnd = weekStart + 5 * 86400;

  const thisWeekEvents = (attendance?.events || []).filter(
    (e) => e.timestamp >= weekStart && e.timestamp < weekEnd
  );

  const byDay: Record<string, ClockEvent[]> = {};
  thisWeekEvents.forEach((e) => {
    const day = new Date(e.timestamp * 1000).toLocaleDateString([], { weekday: "short" });
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(e);
  });

  const contractHours = weeklyHours ? Number((weeklyHours as any)[1]) : 0;
  const contractSeconds = weeklyHours ? Number((weeklyHours as any)[0]) : 0;
  const localEvents = thisWeekEvents.length;

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Hours This Week" value={`${contractHours}h`} sub={formatHours(contractSeconds)} icon="⏱️" />
        <StatCard title="Events Recorded" value={localEvents} sub="stored on 0G" icon="📦" />
        <StatCard title="Est. Earnings" value={`${contractHours} A0GI`} sub="this week" icon="💰" />
      </div>

      {/* Weekly Grid */}
      <div className="og-card rounded-2xl p-5">
        <h3 className="text-base font-semibold text-white mb-4">
          📅 Week {weekNumber} — Daily Breakdown
          <span className="text-sm font-normal text-white/30 ml-2">
            ({getWeekStart(weekNumber).toLocaleDateString()} – {getWeekEnd(weekNumber).toLocaleDateString()})
          </span>
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {DAYS.map((day, idx) => {
            const dayDate = new Date((weekStart + idx * 86400) * 1000);
            const dayKey = dayDate.toLocaleDateString([], { weekday: "short" });
            const events = byDay[dayKey] || [];
            const clockIns = events.filter((e) => e.isClockIn);
            const clockOuts = events.filter((e) => !e.isClockIn);
            const hasActivity = events.length > 0;
            const isToday = new Date().toLocaleDateString([], { weekday: "short" }) === day;

            return (
              <div
                key={day}
                className={`rounded-xl p-3 border text-center transition ${
                  isToday
                    ? "bg-violet-500/10 border-violet-500/30"
                    : hasActivity
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-white/[0.02] border-white/[0.06]"
                }`}
              >
                <p className={`text-xs font-semibold mb-2 ${isToday ? "og-gradient-text" : "text-white/40"}`}>
                  {day}
                  {isToday && <span className="ml-1">•</span>}
                </p>
                {hasActivity ? (
                  <div className="space-y-1">
                    {clockIns[0] && (
                      <p className="text-xs text-emerald-400">
                        In: {new Date(clockIns[0].timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                    {clockOuts[0] && (
                      <p className="text-xs text-red-400">
                        Out: {new Date(clockOuts[0].timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-white/20">—</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Events */}
      <div className="og-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-base font-semibold text-white">🗓️ Recent Activity</h3>
        </div>
        {thisWeekEvents.length === 0 ? (
          <div className="px-5 py-5 text-sm text-white/30">No activity recorded this week.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full og-table text-sm">
              <thead>
                <tr>
                  <th className="text-left">Event</th>
                  <th className="text-left">Time (UTC)</th>
                  <th className="text-left">Date</th>
                  <th className="text-left">Storage</th>
                </tr>
              </thead>
              <tbody>
                {[...thisWeekEvents].reverse().map((e, i) => (
                  <tr key={i}>
                    <td>
                      <StatusBadge label={e.isClockIn ? "Clock In" : "Clock Out"} variant={e.isClockIn ? "success" : "warning"} />
                    </td>
                    <td className="text-white/60 font-mono text-xs">
                      {new Date(e.timestamp * 1000).toLocaleTimeString()}
                    </td>
                    <td className="text-white/40 text-xs">
                      {new Date(e.timestamp * 1000).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                    </td>
                    <td>
                      <StatusBadge label="0G Storage" variant="info" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
