"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useIsEmployee, useIsClockedIn, useWeeklyHours } from "@/hooks/usePayroll";
import { getCurrentWeekNumber } from "@/lib/storage";
import ClockWidget from "@/components/employee/ClockWidget";
import MyAttendance from "@/components/employee/MyAttendance";
import PaymentHistory from "@/components/employee/PaymentHistory";
import { CONTRACT_ADDRESS } from "@/lib/config";
import ThemeToggle from "@/components/shared/ThemeToggle";

type Tab = "clock" | "attendance" | "payments";

export default function EmployeeDashboard() {
  const { address, isConnected } = useAccount();
  const { data: isEmployee, isLoading: checkingRole } = useIsEmployee(address);
  const { data: isClockedIn } = useIsClockedIn(address);
  const { data: weeklyHours } = useWeeklyHours(address, getCurrentWeekNumber());
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("clock");

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "clock", label: "Clock In/Out", icon: "⏰" },
    { id: "attendance", label: "My Hours", icon: "📊" },
    { id: "payments", label: "Payments", icon: "💳" },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 og-grid-bg">
        <div className="og-glow-purple" style={{ top: "20%", left: "20%", opacity: 0.5 }} />
        <div className="og-glow-cyan" style={{ bottom: "20%", right: "20%", opacity: 0.4 }} />
        <div className="relative z-10 text-center space-y-6">
          <div className="text-5xl">👷</div>
          <h1 className="text-3xl font-bold text-white">Employee Dashboard</h1>
          <p className="text-white/40">Connect your wallet to track attendance and view payments</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (checkingRole) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="og-gradient-text animate-pulse text-sm font-medium">Verifying employee status…</div>
      </div>
    );
  }

  if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && isEmployee === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 og-grid-bg">
        <div className="og-glow-purple" style={{ top: "20%", right: "20%", opacity: 0.4 }} />
        <div className="relative z-10 text-center space-y-4 max-w-sm">
          <div className="text-5xl">🚫</div>
          <h2 className="text-xl font-bold text-white">Not Registered</h2>
          <p className="text-white/40 text-sm">
            Wallet {address?.slice(0, 6)}…{address?.slice(-4)} is not registered as an employee. Contact your employer.
          </p>
          <button onClick={() => router.push("/")} className="og-gradient-text hover:opacity-80 text-sm transition">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const hours = weeklyHours ? Number((weeklyHours as any)[1]) : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="og-nav sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="text-white/40 hover:text-white transition text-sm">
              ← Home
            </button>
            <span className="text-white/10">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg og-btn-primary flex items-center justify-center text-xs font-bold">Ø</div>
              <span className="text-white font-semibold">My Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
                isClockedIn
                  ? "og-badge-success"
                  : "og-badge-neutral"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isClockedIn ? "bg-emerald-400 og-pulse" : "bg-white/30"}`} />
              {isClockedIn ? "Working" : "Off Clock"}
            </div>
            <ThemeToggle />
            <ConnectButton showBalance={false} chainStatus="icon" />
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="border-b border-white/[0.06] bg-black/40 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-6 text-sm overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-white/40">This week:</span>
            <span className="text-white font-semibold">{hours}h worked</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-white/40">Earnings:</span>
            <span className="og-gradient-text font-semibold">{hours} A0GI</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-white/40">Next payment:</span>
            <span className="text-cyan-400 font-semibold">Saturday</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap text-xs text-white/20">
            <span>Wallet:</span>
            <span className="font-mono">{address?.slice(0, 6)}…{address?.slice(-4)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 og-card p-1 rounded-xl mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id ? "og-tab-active" : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid md:grid-cols-[340px_1fr] gap-6 items-start">
          {activeTab === "clock" && (
            <>
              <ClockWidget employeeName="Employee" />
              <div className="space-y-4">
                <div className="og-card rounded-2xl p-5">
                  <h3 className="text-base font-semibold text-white mb-3">📌 How It Works</h3>
                  <ul className="space-y-2 text-sm text-white/40">
                    <li className="flex gap-2"><span className="og-gradient-text font-bold">1.</span> Click <strong className="text-white">Clock In</strong> when you start work.</li>
                    <li className="flex gap-2"><span className="og-gradient-text font-bold">2.</span> Click <strong className="text-white">Clock Out</strong> when you finish.</li>
                    <li className="flex gap-2"><span className="og-gradient-text font-bold">3.</span> Your time is verified on-chain and stored on <strong className="text-white">0G Storage</strong>.</li>
                    <li className="flex gap-2"><span className="og-gradient-text font-bold">4.</span> The <strong className="text-white">AI agent</strong> calculates your hours every week.</li>
                    <li className="flex gap-2"><span className="og-gradient-text font-bold">5.</span> Payment is sent to your wallet every <strong className="text-white">Saturday</strong>.</li>
                  </ul>
                </div>
                <div className="og-card rounded-2xl p-5">
                  <h3 className="text-base font-semibold text-white mb-3">📋 Pay Rules</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      ["Rate", "1 A0GI/hour"],
                      ["Schedule", "Mon–Fri"],
                      ["Hours", "9AM–5PM UTC"],
                      ["Max/Day", "8 hours"],
                      ["Overtime", "Not counted"],
                      ["Weekends", "Not counted"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.04]">
                        <span className="text-white/40">{k}</span>
                        <span className="text-white/70 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "attendance" && (
            <div className="md:col-span-2">
              <MyAttendance />
            </div>
          )}

          {activeTab === "payments" && (
            <div className="md:col-span-2">
              <PaymentHistory />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
