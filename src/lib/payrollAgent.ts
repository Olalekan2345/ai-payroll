"use client";

/**
 * AI Payroll Agent
 * Runs autonomously to calculate weekly hours, generate payroll summaries,
 * and trigger payment execution on Saturdays.
 */

import {
  getAllAttendanceLocal,
  getWeekNumber,
  getWeekStart,
  getWeekEnd,
  isWeekday,
} from "./storage";
import { StorageAttendance, EmployeeWeeklySummary } from "@/types";

const SECONDS_PER_HOUR = 3600;
const MAX_SECONDS_PER_DAY = 8 * SECONDS_PER_HOUR;
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17;

export interface AgentInsight {
  totalEmployees: number;
  activeThisWeek: number;
  totalHoursThisWeek: number;
  totalPendingPayout: number; // in A0GI
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  employeeSummaries: EmployeeWeeklySummary[];
  missedDaysReport: { address: string; name: string; missedDays: number }[];
}

// ─── Core Calculation Engine ─────────────────────────────────────────────────

function calculateDayWork(
  clockIn: number,
  clockOut: number
): number {
  // Get work window for the clock-in day
  const dayStart = Math.floor(clockIn / 86400) * 86400;
  const workStart = dayStart + WORK_START_HOUR * SECONDS_PER_HOUR;
  const workEnd = dayStart + WORK_END_HOUR * SECONDS_PER_HOUR;

  const effectiveIn = Math.max(clockIn, workStart);
  const effectiveOut = Math.min(clockOut, workEnd);

  if (effectiveOut <= effectiveIn) return 0;
  const worked = effectiveOut - effectiveIn;
  return Math.min(worked, MAX_SECONDS_PER_DAY);
}

function calculateWeeklySeconds(
  attendance: StorageAttendance,
  weekNumber: number
): { secondsWorked: number; daysWorked: Set<number>; daysInWeek: number[] } {
  let totalSeconds = 0;
  const daysWorked = new Set<number>();
  const weekStart = getWeekStart(weekNumber).getTime() / 1000;
  const weekEnd = weekStart + 5 * 86400; // Mon–Fri only

  // Pair up clock-in/out events
  const weekEvents = attendance.events
    .filter((e) => {
      const t = e.timestamp;
      return t >= weekStart && t < weekEnd;
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  let pendingClockIn: number | null = null;

  for (const event of weekEvents) {
    const date = new Date(event.timestamp * 1000);
    if (!isWeekday(date)) continue;

    if (event.isClockIn) {
      pendingClockIn = event.timestamp;
    } else if (pendingClockIn !== null) {
      const worked = calculateDayWork(pendingClockIn, event.timestamp);
      totalSeconds += worked;
      const dayKey = Math.floor(pendingClockIn / 86400);
      if (worked > 0) daysWorked.add(dayKey);
      pendingClockIn = null;
    }
  }

  // Mon–Fri day keys for this week
  const daysInWeek: number[] = [];
  for (let d = 0; d < 5; d++) {
    daysInWeek.push(Math.floor((weekStart + d * 86400) / 86400));
  }

  return { secondsWorked: totalSeconds, daysWorked, daysInWeek };
}

// ─── Public Agent API ─────────────────────────────────────────────────────────

export function analyzeWeek(weekNumber: number): AgentInsight {
  const allAttendance = getAllAttendanceLocal();
  const summaries: EmployeeWeeklySummary[] = [];
  const missedDaysReport: { address: string; name: string; missedDays: number }[] = [];

  let totalHours = 0;
  let totalPayout = 0;
  let activeCount = 0;

  for (const att of allAttendance) {
    const { secondsWorked, daysWorked, daysInWeek } = calculateWeeklySeconds(att, weekNumber);
    const hoursWorked = secondsWorked / SECONDS_PER_HOUR;
    const amountEarned = hoursWorked; // $1/hour = 1 A0GI/hour
    const missedDays = daysInWeek.filter((d) => !daysWorked.has(d)).length;

    summaries.push({
      address: att.address,
      name: att.name,
      hoursWorked: Math.round(hoursWorked * 100) / 100,
      missedDays,
      amountEarned: Math.round(amountEarned * 1000) / 1000,
      paid: false,
    });

    if (secondsWorked > 0) activeCount++;
    totalHours += hoursWorked;
    totalPayout += amountEarned;

    if (missedDays > 0) {
      missedDaysReport.push({ address: att.address, name: att.name, missedDays });
    }
  }

  const weekStart = getWeekStart(weekNumber);
  const weekEnd = getWeekEnd(weekNumber);

  return {
    totalEmployees: allAttendance.length,
    activeThisWeek: activeCount,
    totalHoursThisWeek: Math.round(totalHours * 100) / 100,
    totalPendingPayout: Math.round(totalPayout * 1000) / 1000,
    weekNumber,
    weekStart: weekStart.toLocaleDateString(),
    weekEnd: weekEnd.toLocaleDateString(),
    employeeSummaries: summaries,
    missedDaysReport,
  };
}

export function shouldExecutePayroll(): boolean {
  const now = new Date();
  return now.getUTCDay() === 6; // Saturday
}

export function getPayrollAddresses(summaries: EmployeeWeeklySummary[]): `0x${string}`[] {
  return summaries
    .filter((s) => s.hoursWorked > 0 && !s.paid)
    .map((s) => s.address as `0x${string}`);
}

export function generateInsightText(insight: AgentInsight): string {
  const lines = [
    `📊 **Week ${insight.weekNumber} Summary** (${insight.weekStart} – ${insight.weekEnd})`,
    ``,
    `👥 Employees: ${insight.totalEmployees} registered, ${insight.activeThisWeek} worked this week`,
    `⏱️ Total Hours: ${insight.totalHoursThisWeek.toFixed(2)}h`,
    `💰 Total Payout: ${insight.totalPendingPayout.toFixed(3)} A0GI`,
    ``,
    `📋 Employee Breakdown:`,
    ...insight.employeeSummaries.map(
      (e) =>
        `  • ${e.name} (${e.address.slice(0, 6)}…${e.address.slice(-4)}): ` +
        `${e.hoursWorked}h worked, ${e.missedDays} day(s) missed, ` +
        `${e.amountEarned.toFixed(3)} A0GI earned`
    ),
  ];

  if (insight.missedDaysReport.length > 0) {
    lines.push(``, `⚠️ Missed Days:`);
    insight.missedDaysReport.forEach((m) => {
      lines.push(`  • ${m.name}: ${m.missedDays} day(s) missed this week`);
    });
  }

  if (shouldExecutePayroll()) {
    lines.push(``, `🤖 **Today is Saturday — Payroll execution is scheduled!**`);
  }

  return lines.join("\n");
}

// ─── Automated Scheduler ──────────────────────────────────────────────────────

let agentIntervalId: ReturnType<typeof setInterval> | null = null;

export function startPayrollAgent(
  onInsight: (insight: AgentInsight) => void,
  onPayrollDue: (weekNumber: number, addresses: `0x${string}`[]) => void,
  intervalMs = 60000
): void {
  if (agentIntervalId) return;

  const tick = () => {
    const weekNumber = getWeekNumber(new Date());
    const insight = analyzeWeek(weekNumber);
    onInsight(insight);

    if (shouldExecutePayroll()) {
      const addresses = getPayrollAddresses(insight.employeeSummaries);
      if (addresses.length > 0) {
        onPayrollDue(weekNumber, addresses);
      }
    }
  };

  tick();
  agentIntervalId = setInterval(tick, intervalMs);
}

export function stopPayrollAgent(): void {
  if (agentIntervalId) {
    clearInterval(agentIntervalId);
    agentIntervalId = null;
  }
}
