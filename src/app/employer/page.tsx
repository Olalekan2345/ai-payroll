"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import RegisterEmployee from "@/components/employer/RegisterEmployee";
import EmployeeTable from "@/components/employer/EmployeeTable";
import AttendanceLogs from "@/components/employer/AttendanceLogs";
import PayrollPanel from "@/components/employer/PayrollPanel";
import { CONTRACT_ADDRESS } from "@/lib/config";
import ThemeToggle from "@/components/shared/ThemeToggle";

type Tab = "overview" | "register" | "attendance" | "payroll";

function ShareEmployeeLink() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/employee`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
        copied
          ? "og-badge-success"
          : "og-btn-ghost"
      }`}
    >
      {copied ? (
        <>✅ Copied!</>
      ) : (
        <>🔗 Share Employee Link</>
      )}
    </button>
  );
}

export default function EmployerDashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "register", label: "Register", icon: "➕" },
    { id: "attendance", label: "Attendance", icon: "📋" },
    { id: "payroll", label: "Payroll & AI", icon: "🤖" },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 og-grid-bg">
        <div className="og-glow-purple" style={{ top: "20%", left: "20%", opacity: 0.5 }} />
        <div className="og-glow-cyan" style={{ bottom: "20%", right: "20%", opacity: 0.4 }} />
        <div className="relative z-10 text-center space-y-6">
          <div className="text-5xl">👨‍💼</div>
          <h1 className="text-3xl font-bold text-white">Employer Dashboard</h1>
          <p className="text-white/40">Connect your admin wallet to manage payroll</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="og-nav sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-white/40 hover:text-white transition text-sm"
            >
              ← Home
            </button>
            <span className="text-white/10">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg og-btn-primary flex items-center justify-center text-xs font-bold">Ø</div>
              <span className="text-white font-semibold">Employer Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShareEmployeeLink />
            <div className="hidden sm:flex items-center gap-2 og-card px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 bg-emerald-400 rounded-full og-pulse" />
              <span className="text-xs text-white/60 font-mono">
                {address?.slice(0, 6)}…{address?.slice(-4)}
              </span>
            </div>
            <ThemeToggle />
            <ConnectButton showBalance={false} chainStatus="icon" />
          </div>
        </div>
      </header>

      {/* Contract notice */}
      {CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-400">
          ⚠️ Contract not deployed yet. Run{" "}
          <code className="bg-amber-500/10 px-1 rounded font-mono">npx hardhat run scripts/deploy.cjs --network 0g-galileo</code>{" "}
          and set <code className="bg-amber-500/10 px-1 rounded font-mono">NEXT_PUBLIC_CONTRACT_ADDRESS</code> in .env.local
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 og-card p-1 rounded-xl mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id ? "og-tab-active" : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <RegisterEmployee onSuccess={() => { setRefreshKey((k) => k + 1); setActiveTab("overview"); }} />
              <div className="og-card rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>🔗</span> 0G Network Info
                </h2>
                <div className="space-y-1 text-sm">
                  {[
                    { label: "Network", value: "0G Galileo Testnet" },
                    { label: "Chain ID", value: "16602" },
                    { label: "Currency", value: "A0GI" },
                    { label: "RPC", value: "evmrpc-testnet.0g.ai" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                      <span className="text-white/40">{label}</span>
                      <span className="text-white/70 font-mono text-xs">{value}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="https://faucet.0g.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="og-btn-ghost block text-center py-2 rounded-xl text-sm"
                >
                  🚰 Get Testnet A0GI Tokens
                </a>
              </div>
            </div>
            <EmployeeTable refresh={refreshKey} />
          </div>
        )}

        {activeTab === "register" && (
          <div className="max-w-lg">
            <RegisterEmployee onSuccess={() => { setRefreshKey((k) => k + 1); setActiveTab("overview"); }} />
          </div>
        )}

        {activeTab === "attendance" && <AttendanceLogs />}
        {activeTab === "payroll" && <PayrollPanel />}
      </div>
    </div>
  );
}
