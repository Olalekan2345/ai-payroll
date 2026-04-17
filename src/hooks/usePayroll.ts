"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CONTRACT_ADDRESS, HOURLY_RATE_WEI } from "@/lib/config";
import { PAYROLL_ABI } from "@/lib/contractABI";
import { getWeekNumber } from "@/lib/storage";

export function useEmployeeList() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "getAllEmployees",
  });
}

export function useIsEmployer(address?: `0x${string}`) {
  // Read the EMPLOYER_ROLE bytes32 from the contract first
  const { data: employerRole } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "EMPLOYER_ROLE",
  });

  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "hasRole",
    args: employerRole && address ? [employerRole as `0x${string}`, address] : undefined,
    query: { enabled: !!address && !!employerRole },
  });
}

export function useIsEmployee(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "isEmployee",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useIsClockedIn(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "isClockedIn",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useWeeklyHours(address?: `0x${string}`, weekNumber?: number) {
  const week = weekNumber ?? getWeekNumber(new Date());
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "getWeeklyHours",
    args: address ? [address, BigInt(week)] : undefined,
    query: { enabled: !!address },
  });
}

export function usePayrollRecord(address?: `0x${string}`, weekNumber?: number) {
  const week = weekNumber ?? getWeekNumber(new Date());
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "getPayrollRecord",
    args: address ? [address, BigInt(week)] : undefined,
    query: { enabled: !!address },
  });
}

export function useContractBalance() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "getContractBalance",
  });
}

export function useRegisterEmployee() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = (
    wallet: `0x${string}`,
    name: string,
    storageKey: string
  ) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PAYROLL_ABI,
      functionName: "registerEmployee",
      args: [wallet, name, HOURLY_RATE_WEI, storageKey],
    });
  };

  return { register, hash, isPending, isConfirming, isSuccess, error };
}

export function useLastClockIn(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "lastClockIn",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useClockInEmployee() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const clockInEmp = (wallet: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PAYROLL_ABI,
      functionName: "clockInEmployee",
      args: [wallet],
    });
  };

  return { clockInEmp, hash, isPending, isConfirming, isSuccess, error };
}

export function useClockOutEmployee() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const clockOutEmp = (wallet: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PAYROLL_ABI,
      functionName: "clockOutEmployee",
      args: [wallet],
    });
  };

  return { clockOutEmp, hash, isPending, isConfirming, isSuccess, error };
}

export function useClockIn() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const clockIn = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PAYROLL_ABI,
      functionName: "clockIn",
    });
  };

  return { clockIn, hash, isPending, isConfirming, isSuccess, error };
}

export function useClockOut() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const clockOut = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PAYROLL_ABI,
      functionName: "clockOut",
    });
  };

  return { clockOut, hash, isPending, isConfirming, isSuccess, error };
}

export function useUpdateSalary() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const updateRate = (wallet: `0x${string}`, newRateWei: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PAYROLL_ABI,
      functionName: "updateHourlyRate",
      args: [wallet, newRateWei],
    });
  };

  return { updateRate, hash, isPending, isConfirming, isSuccess, error };
}

export function useExecutePayroll() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const executePayroll = (wallets: `0x${string}`[], weekNumber: number) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PAYROLL_ABI,
      functionName: "executePayroll",
      args: [wallets, BigInt(weekNumber)],
    });
  };

  return { executePayroll, hash, isPending, isConfirming, isSuccess, error };
}
