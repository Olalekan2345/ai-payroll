"use client";

import { useEffect, useState } from "react";
import { getAllAttendanceLocal } from "@/lib/storage";
import { StorageAttendance } from "@/types";
import StatusBadge from "@/components/shared/StatusBadge";

export default function AttendanceLogs() {
  const [logs, setLogs] = useState<StorageAttendance[]>([]);

  useEffect(() => {
    const load = () => setLogs(getAllAttendanceLocal());
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const allEvents = logs
    .flatMap((l) =>
      l.events.map((e) => ({
        ...e,
        employeeName: l.name,
        employeeAddress: l.address,
      }))
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);

  return (
    <div className="og-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06]">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📋</span> Attendance Logs
          <span className="text-sm font-normal text-white/30 ml-2">(0G Storage)</span>
        </h2>
        <div className="flex items-center gap-2 text-xs og-badge-success px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full og-pulse" />
          Live
        </div>
      </div>

      {allEvents.length === 0 ? (
        <div className="px-6 py-6 text-white/30 text-sm">No attendance events yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full og-table text-sm">
            <thead>
              <tr>
                <th className="text-left">Employee</th>
                <th className="text-left">Event</th>
                <th className="text-left">Time</th>
                <th className="text-left">Date</th>
                <th className="text-left">Week #</th>
                <th className="text-left">Storage</th>
              </tr>
            </thead>
            <tbody>
              {allEvents.map((e, i) => {
                const dt = new Date(e.timestamp * 1000);
                return (
                  <tr key={i}>
                    <td>
                      <div>
                        <p className="text-white">{e.employeeName}</p>
                        <p className="text-xs text-white/30 font-mono">
                          {e.employeeAddress.slice(0, 6)}…{e.employeeAddress.slice(-4)}
                        </p>
                      </div>
                    </td>
                    <td>
                      <StatusBadge
                        label={e.isClockIn ? "Clock In" : "Clock Out"}
                        variant={e.isClockIn ? "success" : "warning"}
                      />
                    </td>
                    <td className="text-white/60 font-mono text-xs">
                      {dt.toLocaleTimeString()}
                    </td>
                    <td className="text-white/40 text-xs">
                      {dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </td>
                    <td className="text-white/40 text-xs">
                      {e.weekNumber}
                    </td>
                    <td>
                      <StatusBadge label="0G Storage" variant="info" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
