export const PAYROLL_ABI = [
  // Constructor
  { inputs: [{ name: "employer", type: "address" }], stateMutability: "nonpayable", type: "constructor" },

  // Roles
  { inputs: [], name: "EMPLOYER_ROLE", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "EMPLOYEE_ROLE", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],
    name: "hasRole",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },

  // Employer Functions
  {
    inputs: [
      { name: "wallet", type: "address" },
      { name: "name", type: "string" },
      { name: "hourlyRateWei", type: "uint256" },
      { name: "storageKey", type: "string" },
    ],
    name: "registerEmployee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "wallet", type: "address" }],
    name: "clockInEmployee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "wallet", type: "address" }],
    name: "clockOutEmployee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "emp", type: "address" }],
    name: "lastClockIn",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "wallet", type: "address" },
      { name: "newRateWei", type: "uint256" },
    ],
    name: "updateHourlyRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "wallet", type: "address" }],
    name: "deactivateEmployee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "wallets", type: "address[]" },
      { name: "weekNumber", type: "uint256" },
    ],
    name: "executePayroll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Employee Functions
  { inputs: [], name: "clockIn", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "clockOut", outputs: [], stateMutability: "nonpayable", type: "function" },

  // View Functions
  {
    inputs: [],
    name: "getAllEmployees",
    outputs: [
      {
        components: [
          { name: "wallet", type: "address" },
          { name: "name", type: "string" },
          { name: "hourlyRateWei", type: "uint256" },
          { name: "active", type: "bool" },
          { name: "registeredAt", type: "uint256" },
          { name: "storageKey", type: "string" },
        ],
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "getEmployeeCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [
      { name: "emp", type: "address" },
      { name: "weekNumber", type: "uint256" },
    ],
    name: "getWeeklyHours",
    outputs: [
      { name: "seconds_", type: "uint256" },
      { name: "hours_", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "emp", type: "address" },
      { name: "weekNumber", type: "uint256" },
    ],
    name: "getPayrollRecord",
    outputs: [
      {
        components: [
          { name: "employee", type: "address" },
          { name: "weekNumber", type: "uint256" },
          { name: "hoursWorked", type: "uint256" },
          { name: "amountPaid", type: "uint256" },
          { name: "paidAt", type: "uint256" },
          { name: "paid", type: "bool" },
        ],
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "getContractBalance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ name: "emp", type: "address" }],
    name: "isClockedIn",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "emp", type: "address" }],
    name: "employees",
    outputs: [
      { name: "wallet", type: "address" },
      { name: "name", type: "string" },
      { name: "hourlyRateWei", type: "uint256" },
      { name: "active", type: "bool" },
      { name: "registeredAt", type: "uint256" },
      { name: "storageKey", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "emp", type: "address" }],
    name: "isEmployee",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "timestamp", type: "uint256" }],
    name: "getWeekNumber",
    outputs: [{ type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ name: "emp", type: "address" }],
    name: "currentlyClockedIn",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_weekNumber", type: "uint256" },
      { name: "emp", type: "address" },
    ],
    name: "weeklySeconds",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "wallet", type: "address" },
      { indexed: false, name: "name", type: "string" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    name: "EmployeeRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "wallet", type: "address" },
      { indexed: false, name: "newRateWei", type: "uint256" },
    ],
    name: "HourlyRateUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "employee", type: "address" },
      { indexed: false, name: "timestamp", type: "uint256" },
      { indexed: false, name: "weekNumber", type: "uint256" },
    ],
    name: "ClockIn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "employee", type: "address" },
      { indexed: false, name: "timestamp", type: "uint256" },
      { indexed: false, name: "secondsWorked", type: "uint256" },
      { indexed: false, name: "weekNumber", type: "uint256" },
    ],
    name: "ClockOut",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "employee", type: "address" },
      { indexed: false, name: "weekNumber", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    name: "PayrollExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "sender", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "FundsDeposited",
    type: "event",
  },

  // Receive
  { stateMutability: "payable", type: "receive" },
] as const;
