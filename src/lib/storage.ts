"use client";

import { StorageAttendance, ClockEvent } from "@/types";

// 0G Storage key helper
export function getAttendanceStorageKey(employeeAddress: string): string {
  return `payroll-attendance-${employeeAddress.toLowerCase()}`;
}

// Upload attendance data via API route (which uses the 0G SDK server-side)
export async function uploadAttendance(
  attendance: StorageAttendance
): Promise<{ rootHash: string; txHash: string }> {
  try {
    const res = await fetch("/api/storage/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendance }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // API not available — fall through to local
  }
  storeAttendanceLocal(attendance);
  return { rootHash: generateMockHash(attendance.address), txHash: "" };
}

// Download attendance data from 0G Storage
export async function downloadAttendance(
  employeeAddress: string
): Promise<StorageAttendance | null> {
  // Try local first; 0G Storage download can be wired up post-deployment
  return getAttendanceLocal(employeeAddress);
}

// Append a clock event and re-upload
export async function appendClockEvent(
  employeeAddress: string,
  employeeName: string,
  event: ClockEvent
): Promise<void> {
  const existing = await downloadAttendance(employeeAddress);
  const attendance: StorageAttendance = existing || {
    address: employeeAddress,
    name: employeeName,
    events: [],
    lastUpdated: Date.now(),
  };

  attendance.events.push(event);
  attendance.lastUpdated = Date.now();

  storeAttendanceLocal(attendance);
  // Non-blocking 0G Storage upload
  uploadAttendance(attendance).catch(console.warn);
}

// ─── Local Storage Helpers (fallback / demo) ──────────────────────────────────

const LS_PREFIX = "0g-payroll-attendance-";

function storeAttendanceLocal(attendance: StorageAttendance): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      LS_PREFIX + attendance.address.toLowerCase(),
      JSON.stringify(attendance)
    );
  } catch {}
}

export function getAttendanceLocal(employeeAddress: string): StorageAttendance | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_PREFIX + employeeAddress.toLowerCase());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAllAttendanceLocal(): StorageAttendance[] {
  if (typeof window === "undefined") return [];
  const results: StorageAttendance[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LS_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) results.push(JSON.parse(raw));
      }
    }
  } catch {}
  return results;
}

function generateMockHash(address: string): string {
  return "0x" + Buffer.from(address + Date.now()).toString("hex").slice(0, 64);
}

// ─── Week Calculation Helpers ─────────────────────────────────────────────────

export function getWeekNumber(date: Date): number {
  const dayMs = 86400000;
  const daysSinceEpoch = Math.floor(date.getTime() / dayMs);
  const weekday = (daysSinceEpoch + 3) % 7; // 0=Mon
  return Math.floor((daysSinceEpoch - weekday) / 7);
}

export function getWeekStart(weekNumber: number): Date {
  return new Date(weekNumber * 7 * 86400000);
}

export function getWeekEnd(weekNumber: number): Date {
  return new Date((weekNumber * 7 + 4) * 86400000 + 86399999); // Friday end
}

export function getCurrentWeekNumber(): number {
  return getWeekNumber(new Date());
}

export function isWeekday(date: Date): boolean {
  const day = date.getUTCDay();
  return day >= 1 && day <= 5; // Mon–Fri
}

export function formatHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
