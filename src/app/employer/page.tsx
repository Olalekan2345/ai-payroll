"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import RegisterEmployee from "@/components/employer/RegisterEmployee";
import EmployeeTable from "@/components/employer/EmployeeTable";
import AttendanceLogs from "@/components/employer/AttendanceLogs";
import PayrollPanel from "@/components/employer/PayrollPanel";
import ClockManagement from "@/components/employer/ClockManagement";
import PayrollPool from "@/components/employer/PayrollPool";
import TxStatus from "@/components/shared/TxStatus";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { FACTORY_DEPLOYED, CONTRACT_ADDRESS, ZERO_ADDRESS } from "@/lib/config";
import {
  useMyPayrollContract,
  useIsEmployeeAnywhere,
  useCreatePayroll,
  isZeroAddress,
} from "@/hooks/useFactory";

type Tab = "overview" | "register" | "clock" | "attendance" | "payroll";

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
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${copied ? "og-badge-success" : "og-btn-ghost"}`}
    >
      {copied ? <>✅ Copied!</> : <>🔗 Share Employee Link</>}
    </button>
  );
}

// ── Deploy screen shown when employer has no contract yet ──────────────────────
function DeployScreen({ address, onDeployed }: { address: `0x${string}`; onDeployed: () => void }) {
  const { createPayroll, isPending, isConfirming, isSuccess, error, hash } = useCreatePayroll();

  useEffect(() => {
    if (isSuccess) {
      // Give the chain a moment, then ask parent to refetch
      const t = setTimeout(onDeployed, 4000);
      return () => clearTimeout(t);
    }
  }, [isSuccess, onDeployed]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 og-grid-bg">
      <div className="og-glow-purple" style={{ top: "15%", left: "10%", opacity: 0.6 }} />
      <div className="og-glow-pink" style={{ bottom: "15%", right: "10%", opacity: 0.5 }} />

      <div className="relative z-10 max-w-lg w-full">
        <div className="og-card rounded-3xl p-8 text-center space-y-6"
          style={{ background: "rgba(22,22,22,0.95)", border: "1px solid rgba(165,64,240,0.3)", boxShadow: "0 0 60px rgba(165,64,240,0.15)" }}>

          <div className="w-16 h-16 rounded-2xl og-btn-primary flex items-center justify-center text-3xl mx-auto">
            🏭
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Deploy Your Payroll Contract</h1>
            <p className="text-white/50 text-sm leading-relaxed">
              Your wallet doesn&apos;t have a payroll contract yet. Deploy one to start managing employees, tracking attendance, and running payroll — all on-chain.
            </p>
          </div>

          {/* Info pills */}
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: "⛓️", label: "On-chain RBAC", sub: "Role-based access control" },
              { icon: "👥", label: "Your employees", sub: "Isolated to your contract" },
              { icon: "💸", label: "You control payroll", sub: "Execute when you choose" },
              { icon: "🔒", label: "Exclusive access", sub: "Only your wallet can manage" },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="og-card rounded-xl p-3 flex items-start gap-2"
                style={{ background: "rgba(165,64,240,0.06)", borderColor: "rgba(165,64,240,0.2)" }}>
                <span className="text-lg">{icon}</span>
                <div>
                  <p className="text-white text-xs font-semibold">{label}</p>
                  <p className="text-white/40 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Wallet info */}
          <div className="og-card rounded-xl px-4 py-2.5 flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <span className="text-white/40 text-xs">Deploying from</span>
            <span className="text-white/70 font-mono text-xs">{address.slice(0, 8)}…{address.slice(-6)}</span>
          </div>

          <button
            onClick={createPayroll}
            disabled={isPending || isConfirming || isSuccess}
            className="og-btn-primary w-full py-3.5 rounded-xl font-semibold text-base"
          >
            {isPending ? "Confirm in wallet…" : isConfirming ? "Deploying contract…" : isSuccess ? "✅ Deployed!" : "🚀 Deploy My Payroll Contract"}
          </button>

          <TxStatus hash={hash} isPending={isPending} isConfirming={isConfirming} isSuccess={isSuccess} error={error as Error} label="Contract deployment" />

          {isSuccess && (
            <p className="text-white/40 text-sm animate-pulse">Refreshing your dashboard…</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function EmployerDashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [refreshKey, setRefreshKey] = useState(0);
  const [waitingForDeploy, setWaitingForDeploy] = useState(false);

  // Factory queries
  const {
    data: myContractRaw,
    isLoading: loadingContract,
    refetch: refetchContract,
  } = useMyPayrollContract(address);

  const {
    data: isEmployeeAnywhere,
    isLoading: loadingEmployeeCheck,
  } = useIsEmployeeAnywhere(address);

  // Resolve contract address
  const myContract = myContractRaw as `0x${string}` | undefined;
  const hasContract = !isZeroAddress(myContract);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "register", label: "Register", icon: "➕" },
    { id: "clock", label: "Clock", icon: "⏰" },
    { id: "attendance", label: "Attendance", icon: "📋" },
    { id: "payroll", label: "Payroll & AI", icon: "🤖" },
  ];

  // ── Not connected ──
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 og-grid-bg">
        <div className="og-glow-purple" style={{ top: "20%", left: "20%", opacity: 0.5 }} />
        <div className="og-glow-pink" style={{ bottom: "20%", right: "20%", opacity: 0.4 }} />
        <div className="relative z-10 text-center space-y-6">
          <div className="text-5xl">👨‍💼</div>
          <h1 className="text-3xl font-bold text-white">Employer Dashboard</h1>
          <p className="text-white/40">Connect your wallet to manage payroll</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  // ── Checking factory ──
  if (FACTORY_DEPLOYED && (loadingContract || loadingEmployeeCheck || waitingForDeploy)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="og-gradient-text animate-pulse text-sm font-medium">Checking your payroll contract…</div>
      </div>
    );
  }

  // ── Blocked: already an employee somewhere ──
  if (FACTORY_DEPLOYED && isEmployeeAnywhere === true) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 og-grid-bg">
        <div className="og-glow-purple" style={{ top: "20%", right: "20%", opacity: 0.5 }} />
        <div className="relative z-10 text-center space-y-5 max-w-sm">
          <div className="text-5xl">🚫</div>
          <h2 className="text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            Wallet{" "}
            <span className="font-mono text-white/60">{address?.slice(0, 6)}…{address?.slice(-4)}</span>{" "}
            is registered as an employee under another employer. Employers and employees must be separate wallets.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/employee")} className="og-btn-ghost px-5 py-2.5 rounded-xl text-sm font-medium">
              Go to Employee Dashboard
            </button>
            <button onClick={() => router.push("/")} className="og-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
              ← Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── No contract yet — show deploy screen ──
  if (FACTORY_DEPLOYED && !hasContract) {
    return (
      <div>
        {/* Minimal nav */}
        <nav className="og-nav fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/")} className="text-white/40 hover:text-white transition text-sm">← Home</button>
              <span className="text-white/10">|</span>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg og-btn-primary flex items-center justify-center text-xs font-bold">Ø</div>
                <span className="text-white font-semibold">Employer Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <ConnectButton showBalance={false} chainStatus="icon" />
            </div>
          </div>
        </nav>
        <div className="pt-14">
          <DeployScreen address={address!} onDeployed={() => { setWaitingForDeploy(true); refetchContract(); }} />
        </div>
      </div>
    );
  }

  // Contract address: factory contract → env CONTRACT_ADDRESS fallback → undefined
  const legacyContract = CONTRACT_ADDRESS !== ZERO_ADDRESS ? CONTRACT_ADDRESS : undefined;
  const contractAddress = (
    FACTORY_DEPLOYED ? (hasContract ? myContract : undefined) : legacyContract
  ) as `0x${string}` | undefined;

  // ── Full dashboard ──
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="og-nav sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="text-white/40 hover:text-white transition text-sm">← Home</button>
            <span className="text-white/10">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg og-btn-primary flex items-center justify-center text-xs font-bold">Ø</div>
              <span className="text-white font-semibold">Employer Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShareEmployeeLink />
            {contractAddress && (
              <a
                href={`https://chainscan-galileo.0g.ai/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 og-btn-ghost text-xs px-3 py-1.5 rounded-xl"
                title="View your payroll contract on explorer"
              >
                📄 My Contract
              </a>
            )}
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

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Top row: Register + Payroll Pool */}
            <div className="grid md:grid-cols-2 gap-6">
              <RegisterEmployee
                contractAddress={contractAddress}
                onSuccess={() => { setRefreshKey((k) => k + 1); setActiveTab("overview"); }}
              />
              <PayrollPool contractAddress={contractAddress} />
            </div>

            {/* Network info row */}
            <div className="og-card rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔗</span>
                  <span className="text-white font-semibold text-sm">0G Galileo Testnet</span>
                  <span className="og-badge-info text-xs px-2 py-0.5 rounded-full">Chain 16602</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs">
                  {[
                    { label: "Currency", value: "A0GI" },
                    { label: "RPC", value: "evmrpc-testnet.0g.ai" },
                    ...(contractAddress ? [{ label: "Contract", value: `${contractAddress.slice(0, 8)}…${contractAddress.slice(-6)}` }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="text-white/30">{label}:</span>
                      <span className="text-white/60 font-mono">{value}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="https://faucet.0g.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="og-btn-ghost px-4 py-1.5 rounded-xl text-xs"
                >
                  🚰 Get A0GI Tokens
                </a>
              </div>
            </div>

            <EmployeeTable refresh={refreshKey} contractAddress={contractAddress} />
          </div>
        )}

        {activeTab === "register" && (
          <div className="max-w-lg">
            <RegisterEmployee
              contractAddress={contractAddress}
              onSuccess={() => { setRefreshKey((k) => k + 1); setActiveTab("overview"); }}
            />
          </div>
        )}

        {activeTab === "clock" && <ClockManagement contractAddress={contractAddress} />}
        {activeTab === "attendance" && <AttendanceLogs />}
        {activeTab === "payroll" && <PayrollPanel contractAddress={contractAddress} />}
      </div>
    </div>
  );
}
