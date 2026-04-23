"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_DEPLOYED, ZERO_ADDRESS } from "@/lib/config";
import { FACTORY_ABI } from "@/lib/factoryABI";

/** Returns the PayrollManager address for a given employer, or 0x0 if none. */
export function useMyPayrollContract(address?: `0x${string}`) {
  return useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getContract",
    args: address ? [address] : undefined,
    query: { enabled: FACTORY_DEPLOYED && !!address },
  });
}

/** Returns the PayrollManager address an employee belongs to, or 0x0 if none. */
export function useEmployeeContract(address?: `0x${string}`) {
  return useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "employeeToContract",
    args: address ? [address] : undefined,
    query: { enabled: FACTORY_DEPLOYED && !!address },
  });
}

/** Returns true if this wallet is registered as an employee in any contract. */
export function useIsEmployeeAnywhere(address?: `0x${string}`) {
  return useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "isEmployee",
    args: address ? [address] : undefined,
    query: { enabled: FACTORY_DEPLOYED && !!address },
  });
}

/** Deploys a new PayrollManager for the caller via the factory. */
export function useCreatePayroll() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createPayroll = () => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "createPayroll",
    });
  };

  return { createPayroll, hash, isPending, isConfirming, isSuccess, error };
}

export function isZeroAddress(addr: string | undefined): boolean {
  return !addr || addr === ZERO_ADDRESS;
}
