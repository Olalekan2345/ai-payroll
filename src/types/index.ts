export interface Employee {
  wallet: string;
  name: string;
  hourlyRateWei: bigint;
  active: boolean;
  registeredAt: bigint;
  storageKey: string;
}

export interface ClockEvent {
  employee: string;
  timestamp: number;
  isClockIn: boolean;
  weekNumber: number;
  txHash?: string;
}

export interface AttendanceLog {
  employeeAddress: string;
  events: ClockEvent[];
  weeklyHours: number;
  storageKey: string;
}

export interface PayrollRecord {
  employee: string;
  weekNumber: bigint;
  hoursWorked: bigint;
  amountPaid: bigint;
  paidAt: bigint;
  paid: boolean;
}

export interface WeeklySummary {
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  employees: EmployeeWeeklySummary[];
  totalPaid: number;
  executedAt?: number;
}

export interface EmployeeWeeklySummary {
  address: string;
  name: string;
  hoursWorked: number;
  missedDays: number;
  amountEarned: number;
  paid: boolean;
}

export interface StorageAttendance {
  address: string;
  name: string;
  events: ClockEvent[];
  lastUpdated: number;
}
