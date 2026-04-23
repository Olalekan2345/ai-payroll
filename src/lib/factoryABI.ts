export const FACTORY_ABI = [
  // Deploy a new PayrollManager
  {
    inputs: [],
    name: "createPayroll",
    outputs: [{ type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Read employer's PayrollManager address (returns 0x0 if none)
  {
    inputs: [{ name: "employer", type: "address" }],
    name: "getContract",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "employer", type: "address" }],
    name: "hasContract",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  // Read employee's PayrollManager address (returns 0x0 if not an employee)
  {
    inputs: [{ name: "wallet", type: "address" }],
    name: "employeeToContract",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "wallet", type: "address" }],
    name: "isEmployee",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractCount",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "employer", type: "address" },
      { indexed: true, name: "payrollContract", type: "address" },
    ],
    name: "PayrollCreated",
    type: "event",
  },
] as const;
