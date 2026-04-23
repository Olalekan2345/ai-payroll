"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSendTransaction,
} from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, HOURLY_RATE_WEI } from "@/lib/config";
import { PAYROLL_ABI } from "@/lib/contractABI";
import { getWeekNumber } from "@/lib/storage";

function resolveContract(override?: `0x${string}`): `0x${string}` {
  return override ?? CONTRACT_ADDRESS;
}

export function useEmployeeList(contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  return useReadContract({
    address: addr,
    abi: PAYROLL_ABI,
    functionName: "getAllEmployees",
    query: { enabled: addr !== "0x0000000000000000000000000000000000000000" },
  });
}

export function useIsEmployer(address?: `0x${string}`, contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  const { data: employerRole } = useReadContract({
    address: addr,
    abi: PAYROLL_ABI,
    functionName: "EMPLOYER_ROLE",
    query: { enabled: addr !== "0x0000000000000000000000000000000000000000" },
  });

  return useReadContract({
    address: addr,
    abi: PAYROLL_ABI,
    functionName: "hasRole",
    args: employerRole && address ? [employerRole as `0x${string}`, address] : undefined,
    query: { enabled: !!address && !!employerRole },
  });
}

export function useIsEmployee(address?: `0x${string}`, contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  return useReadContract({
    address: addr,
    abi: PAYROLL_ABI,
    functionName: "isEmployee",
    args: address ? [address] : undefined,
    query: { enabled: !!address && addr !== "0x0000000000000000000000000000000000000000" },
  });
}

export function useIsClockedIn(address?: `0x${string}`, contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  return useReadContract({
    address: addr,
    abi: PAYROLL_ABI,
    functionName: "isClockedIn",
    args: address ? [address] : undefined,
    query: { enabled: !!address && addr !== "0x0000000000000000000000000000000000000000", refetchInterval: 5000 },
  });
}

export function useWeeklyHours(address?: `0x${string}`, weekNumber?: number, contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  const week = weekNumber ?? getWeekNumber(new Date());
  return useReadContract({
    address: addr,
    abi: PAYROLL_ABI,
    functionName: "getWeeklyHours",
    args: address ? [address, BigInt(week)] : undefined,
    query: { enabled: !!address && addr !== "0x0000000000000000000000000000000000000000" },
  });
}

export function usePayrollRecord(address?: `0x${string}`, weekNumber?: number, contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  const week = weekNumber ?? getWeekNumber(new Date());
  return useReadContract({
    address: addr,
    abi: PAYROLL_ABI,
    functionName: "getPayrollRecord",
    args: address ? [address, BigInt(week)] : undefined,
    query: { enabled: !!address && addr !== "0x0000000000000000000000000000000000000000" },
  });
}

export function useContractBalance(contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  return useReadContract({
    address: addr,
    abi: PAYROLL_ABI,
    functionName: "getContractBalance",
    query: { enabled: addr !== "0x0000000000000000000000000000000000000000" },
  });
}

export function useRegisterEmployee(contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = (wallet: `0x${string}`, name: string, storageKey: string, hourlyRateWei?: bigint) => {
    writeContract({
      address: addr,
      abi: PAYROLL_ABI,
      functionName: "registerEmployee",
      args: [wallet, name, hourlyRateWei ?? HOURLY_RATE_WEI, storageKey],
    });
  };

  return { register, hash, isPending, isConfirming, isSuccess, error };
}

export function useLastClockIn(address?: `0x${string}`, contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  return useReadContract({
    address: addr,
    abi: PAYROLL_ABI,
    functionName: "lastClockIn",
    args: address ? [address] : undefined,
    query: { enabled: !!address && addr !== "0x0000000000000000000000000000000000000000" },
  });
}

export function useClockInEmployee(contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const clockInEmp = (wallet: `0x${string}`) => {
    writeContract({
      address: addr,
      abi: PAYROLL_ABI,
      functionName: "clockInEmployee",
      args: [wallet],
    });
  };

  return { clockInEmp, hash, isPending, isConfirming, isSuccess, error };
}

export function useClockOutEmployee(contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const clockOutEmp = (wallet: `0x${string}`) => {
    writeContract({
      address: addr,
      abi: PAYROLL_ABI,
      functionName: "clockOutEmployee",
      args: [wallet],
    });
  };

  return { clockOutEmp, hash, isPending, isConfirming, isSuccess, error };
}

export function useClockIn(contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const clockIn = () => {
    writeContract({
      address: addr,
      abi: PAYROLL_ABI,
      functionName: "clockIn",
    });
  };

  return { clockIn, hash, isPending, isConfirming, isSuccess, error };
}

export function useClockOut(contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const clockOut = () => {
    writeContract({
      address: addr,
      abi: PAYROLL_ABI,
      functionName: "clockOut",
    });
  };

  return { clockOut, hash, isPending, isConfirming, isSuccess, error };
}

export function useUpdateSalary(contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const updateRate = (wallet: `0x${string}`, newRateWei: bigint) => {
    writeContract({
      address: addr,
      abi: PAYROLL_ABI,
      functionName: "updateHourlyRate",
      args: [wallet, newRateWei],
    });
  };

  return { updateRate, hash, isPending, isConfirming, isSuccess, error };
}

export function useExecutePayroll(contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const executePayroll = (wallets: `0x${string}`[], weekNumber: number) => {
    writeContract({
      address: addr,
      abi: PAYROLL_ABI,
      functionName: "executePayroll",
      args: [wallets, BigInt(weekNumber)],
    });
  };

  return { executePayroll, hash, isPending, isConfirming, isSuccess, error };
}

export function useRemoveEmployee(contractAddress?: `0x${string}`) {
  const addr = resolveContract(contractAddress);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const removeEmployee = (wallet: `0x${string}`) => {
    writeContract({
      address: addr,
      abi: PAYROLL_ABI,
      functionName: "removeEmployee",
      args: [wallet],
    });
  };

  return { removeEmployee, hash, isPending, isConfirming, isSuccess, error };
}

export function useDepositToContract() {
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = (contractAddr: `0x${string}`, amountEth: string) => {
    sendTransaction({ to: contractAddr, value: parseEther(amountEth) });
  };

  return { deposit, hash, isPending, isConfirming, isSuccess, error };
}
