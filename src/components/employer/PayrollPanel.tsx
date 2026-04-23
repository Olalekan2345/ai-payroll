"use client";

import { useEffect, useState } from "react";
import { useEmployeeList, useExecutePayroll, useContractBalance } from "@/hooks/usePayroll";
import {
  analyzeWeek,
  shouldExecutePayroll,
  AgentInsight,
  startPayrollAgent,
  stopPayrollAgent,
} from "@/lib/payrollAgent";
import { getCurrentWeekNumber } from "@/lib/storage";
import StatCard from "@/components/shared/StatCard";
import TxStatus from "@/components/shared/TxStatus";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatEther } from "viem";

export default function PayrollPanel({ contractAddress }: { contractAddress?: `0x${string}` }) {
  const [insight, setInsight] = useState<AgentInsight | null>(null);
  const [agentLog, setAgentLog] = useState<string[]>([]);
  const [agentRunning, setAgentRunning] = useState(false);
  const { data: employees } = useEmployeeList(contractAddress);
  const { data: contractBalance } = useContractBalance(contractAddress);
  const { executePayroll, isPending, isConfirming, isSuccess, error, hash } = useExecutePayroll(contractAddress);
  const weekNumber = getCurrentWeekNumber();

  useEffect(() => {
    const current = analyzeWeek(weekNumber);
    setInsight(current);
  }, [weekNumber]);

  const toggleAgent = () => {
    if (agentRunning) {
      stopPayrollAgent();
      setAgentRunning(false);
      setAgentLog((p) => [...p, `[${new Date().toLocaleTimeString()}] Agent stopped.`]);
    } else {
      setAgentRunning(true);
      setAgentLog((p) => [...p, `[${new Date().toLocaleTimeString()}] Agent started — monitoring attendance…`]);
      startPayrollAgent(
        (ins) => {
          setInsight(ins);
          setAgentLog((p) => [
            ...p.slice(-30),
            `[${new Date().toLocaleTimeString()}] Analyzed week ${ins.weekNumber}: ${ins.totalHoursThisWeek}h total, ${ins.totalPendingPayout} A0GI due`,
          ]);
        },
        (wk, addresses) => {
          setAgentLog((p) => [
            ...p,
            `[${new Date().toLocaleTimeString()}] 🤖 Saturday detected! Triggering payroll for ${addresses.length} employee(s)…`,
          ]);
          executePayroll(addresses, wk);
        },
        30000
      );
    }
  };

  const handleManualPayroll = () => {
    if (!insight) return;
    const empList = (employees as any[]) || [];
    const addresses = empList
      .filter((e: any) => e.active)
      .map((e: any) => e.wallet as `0x${string}`);
    if (addresses.length === 0) return;
    executePayroll(addresses, weekNumber);
  };

  const balanceEth = contractBalance ? formatEther(contractBalance as bigint) : "0";

  return (
    <div className="space-y-5">
      {/* Stats */}
      {insight && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Employees" value={insight.totalEmployees} icon="👥" />
          <StatCard title="Active This Week" value={insight.activeThisWeek} icon="✅" />
          <StatCard title="Total Hours" value={`${insight.totalHoursThisWeek}h`} sub={`Week ${insight.weekNumber}`} icon="⏱️" />
          <StatCard title="Pending Payout" value={`${insight.totalPendingPayout} A0GI`} sub={`Balance: ${balanceEth} A0GI`} icon="💰" />
        </div>
      )}

      {/* Agent Controls */}
      <div className="og-card rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-white/40">Contract Balance</p>
            <p className="text-2xl font-bold text-white mt-1">{balanceEth} <span className="og-gradient-text">A0GI</span></p>
            <a
              href={`https://chainscan-galileo.0g.ai/address/${contractAddress ?? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs og-gradient-text hover:opacity-80 hover:underline mt-0.5 inline-block transition"
            >
              View contract ↗
            </a>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={toggleAgent}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                agentRunning
                  ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  : "og-badge-success hover:bg-emerald-500/20"
              }`}
            >
              {agentRunning ? "⏹ Stop AI Agent" : "▶ Start AI Agent"}
            </button>
            <button
              onClick={handleManualPayroll}
              disabled={isPending || isConfirming}
              className="og-btn-primary px-4 py-2 rounded-xl text-sm font-semibold"
            >
              💸 Execute Payroll Now
            </button>
          </div>
        </div>
        <TxStatus hash={hash} isPending={isPending} isConfirming={isConfirming} isSuccess={isSuccess} error={error as Error} label="Payroll" />
      </div>

      {/* Employee Summaries */}
      {insight && insight.employeeSummaries.length > 0 && (
        <div className="og-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h3 className="text-base font-semibold text-white">
              📊 Week {insight.weekNumber} Payroll Summary
              <span className="ml-2 text-sm font-normal text-white/30">
                ({insight.weekStart} – {insight.weekEnd})
              </span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full og-table text-sm">
              <thead>
                <tr>
                  <th className="text-left">Employee</th>
                  <th className="text-left">Hours</th>
                  <th className="text-left">Days Missed</th>
                  <th className="text-left">Earned</th>
                  <th className="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {insight.employeeSummaries.map((s) => (
                  <tr key={s.address}>
                    <td>
                      <p className="text-white">{s.name}</p>
                      <p className="text-xs text-white/30 font-mono">
                        {s.address.slice(0, 6)}…{s.address.slice(-4)}
                      </p>
                    </td>
                    <td className="text-white/60">{s.hoursWorked}h</td>
                    <td>
                      {s.missedDays > 0 ? (
                        <StatusBadge label={`${s.missedDays} day(s)`} variant="warning" />
                      ) : (
                        <StatusBadge label="Perfect" variant="success" />
                      )}
                    </td>
                    <td className="og-gradient-text font-medium">
                      {s.amountEarned.toFixed(3)} A0GI
                    </td>
                    <td>
                      <StatusBadge label={s.paid ? "Paid" : "Pending"} variant={s.paid ? "success" : "neutral"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Agent Log */}
      <div className="og-card rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-base font-semibold text-white">🤖 AI Agent Log</h3>
          {agentRunning && (
            <span className="og-badge-success flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full og-pulse" /> Running
            </span>
          )}
        </div>
        <div className="bg-black/60 rounded-xl p-3 font-mono text-xs text-white/40 h-36 overflow-y-auto space-y-1 border border-white/[0.05]">
          {agentLog.length === 0 ? (
            <p className="text-white/20">Start the agent to see real-time payroll insights…</p>
          ) : (
            agentLog.map((line, i) => <p key={i}>{line}</p>)
          )}
        </div>
        {shouldExecutePayroll() && (
          <div className="mt-3 p-3 og-badge-warning rounded-xl text-sm">
            🎯 Today is <strong>Saturday</strong> — automated payroll execution is scheduled!
          </div>
        )}
      </div>
    </div>
  );
}
