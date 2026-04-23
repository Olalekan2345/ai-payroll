"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import ThemeToggle from "@/components/shared/ThemeToggle";

const FEATURES = [
  { icon: "⛓️", title: "0G Blockchain", desc: "Smart contracts deployed on 0G Galileo Testnet with verifiable on-chain payroll execution." },
  { icon: "📦", title: "0G Storage", desc: "All attendance records stored permanently on 0G's decentralized storage layer." },
  { icon: "🤖", title: "AI Payroll Agent", desc: "Autonomous agent monitors attendance, calculates weekly pay, and triggers payments every Saturday." },
  { icon: "🔐", title: "Role-Based Access", desc: "Separate dashboards for Employers and Employees enforced by on-chain RBAC." },
  { icon: "⏱️", title: "Attendance Tracking", desc: "Clock in/out recorded on-chain — Mon–Fri, 9 AM–5 PM UTC, max 8 hours/day." },
  { icon: "💸", title: "Auto Payments", desc: "1 A0GI per hour, paid directly to employee wallets every Saturday automatically." },
];

const FLOW = [
  { step: "01", actor: "Employer", action: "Connects wallet and registers employees with their wallet addresses on-chain." },
  { step: "02", actor: "Employee", action: "Connects wallet and clocks in/out — events recorded on-chain and stored on 0G Storage." },
  { step: "03", actor: "AI Agent", action: "Calculates weekly hours (Mon–Fri, 9–5 only) and generates payroll summaries." },
  { step: "04", actor: "Contract", action: "Executes batch A0GI payments every Saturday directly to employee wallets." },
];

export default function Landing() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "transparent" }}>

      {/* Nav */}
      <nav className="og-nav fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg og-btn-primary flex items-center justify-center text-sm font-bold">
              Ø
            </div>
            <span className="text-white font-semibold tracking-tight">AI Payroll</span>
            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full og-badge-info font-medium">
              0G Galileo
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/employer" className="hidden sm:block text-sm text-white/60 hover:text-white transition">
              Employer
            </Link>
            <Link href="/employee" className="hidden sm:block text-sm text-white/60 hover:text-white transition">
              Employee
            </Link>
            <ThemeToggle />
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 og-grid-bg overflow-hidden">
        {/* Deep gradient mesh */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 0%, rgba(165,64,240,0.28) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(246,51,154,0.15) 0%, transparent 60%)"
        }} />
        {/* Glow blobs */}
        <div className="og-glow-purple og-orb" style={{ top: "5%", left: "3%", opacity: 1 }} />
        <div className="og-glow-pink og-orb" style={{ top: "15%", right: "3%", animationDelay: "3s", opacity: 0.9 }} />
        <div className="og-glow-purple" style={{ bottom: "5%", right: "15%", opacity: 0.5, width: "500px", height: "500px" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full og-card text-sm mb-8"
            style={{ background: "rgba(124,58,237,0.12)", borderColor: "rgba(192,132,252,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full og-pulse" style={{ background: "#a540f0" }} />
            <span className="text-white/60">Powered by</span>
            <span className="og-gradient-text font-semibold">0G Labs</span>
            <span className="text-white/30">·</span>
            <span className="text-white/60">Galileo Testnet</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Decentralized{" "}
            <span className="og-gradient-text">AI Payroll</span>
            <br />
            <span className="text-white/90">on 0G Blockchain</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
            An autonomous payroll agent that tracks employee attendance, calculates working hours,
            and executes weekly payments — fully on-chain and verifiable.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/employer"
              className="og-btn-primary px-8 py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2"
            >
              <span>👨‍💼</span>
              Employer Dashboard
            </Link>
            <Link
              href="/employee"
              className="og-btn-ghost px-8 py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2"
            >
              <span>👷</span>
              Employee Dashboard
            </Link>
          </div>

          {!isConnected && (
            <p className="text-white/30 text-sm">Connect your wallet to get started</p>
          )}

          {/* Stat pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {[
              { label: "Chain ID", value: "16602" },
              { label: "Pay Rate", value: "1 A0GI/hr" },
              { label: "Pay Cycle", value: "Weekly" },
              { label: "Network", value: "0G Galileo" },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 py-2 rounded-full text-sm flex items-center gap-2"
                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(139,92,246,0.28)" }}>
                <span className="text-white/40">{label}</span>
                <span className="og-gradient-text font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-28 og-grid-bg overflow-hidden">
        {/* Deep purple band */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(88,28,135,0.15) 30%, rgba(88,28,135,0.2) 60%, transparent 100%)"
        }} />
        <div className="og-glow-purple" style={{ top: "10%", right: "-5%", opacity: 0.8 }} />
        <div className="og-glow-pink" style={{ bottom: "10%", left: "-5%", opacity: 0.5 }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold og-gradient-text tracking-widest uppercase mb-3">Features</p>
            <h2 className="text-4xl font-bold text-white">Built for the decentralized era</h2>
            <p className="text-white/40 mt-4 max-w-lg mx-auto">
              Every component of the payroll stack runs on 0G infrastructure — storage, compute, and settlement.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="og-card rounded-2xl p-6 group cursor-default">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 transition group-hover:scale-110"
                  style={{
                    background: "linear-gradient(135deg, rgba(165,64,240,0.25), rgba(246,51,154,0.15))",
                    border: "1px solid rgba(165,64,240,0.35)",
                    boxShadow: "0 0 16px rgba(165,64,240,0.2)"
                  }}>
                  {icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(246,51,154,0.08) 0%, transparent 70%)"
        }} />
        <div className="og-glow-pink" style={{ top: "20%", left: "-5%", opacity: 0.7 }} />
        <div className="og-glow-purple" style={{ bottom: "10%", right: "-5%", opacity: 0.5 }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold og-gradient-text tracking-widest uppercase mb-3">Flow</p>
            <h2 className="text-4xl font-bold text-white">How it works</h2>
          </div>
          <div className="space-y-3">
            {FLOW.map(({ step, actor, action }) => (
              <div key={step} className="og-card rounded-2xl p-6 flex items-start gap-5 group"
                style={{ background: "rgba(124,58,237,0.08)" }}>
                <div className="shrink-0 og-gradient-text text-lg font-black tracking-wider pt-0.5 group-hover:scale-110 transition">{step}</div>
                <div className="w-px self-stretch"
                  style={{ background: "linear-gradient(to bottom, rgba(192,132,252,0.5), transparent)" }} />
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: "#c084fc" }}>{actor}</p>
                  <p className="text-white/70 text-sm leading-relaxed">{action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-3xl p-12 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(88,28,135,0.5) 0%, rgba(30,5,69,0.7) 40%, rgba(7,34,68,0.6) 100%)",
            border: "1px solid rgba(139,92,246,0.3)",
            boxShadow: "0 0 60px rgba(165,64,240,0.2), 0 0 120px rgba(246,51,154,0.08), inset 0 1px 0 rgba(192,132,252,0.15)"
          }}>
          <div className="og-glow-purple" style={{ top: "-40%", left: "5%", width: "400px", height: "400px", opacity: 0.7 }} />
          <div className="og-glow-pink" style={{ bottom: "-40%", right: "5%", width: "350px", height: "350px", opacity: 0.5 }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 og-grid-bg opacity-30 rounded-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to automate payroll<br />on <span className="og-gradient-text">0G</span>?
            </h2>
            <p className="text-white/50 mb-8">
              Deploy the contract, register your team, and let the AI agent handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/employer" className="og-btn-primary px-8 py-3.5 rounded-xl font-semibold">
                Launch as Employer
              </Link>
              <a
                href="https://faucet.0g.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="og-btn-ghost px-8 py-3.5 rounded-xl font-semibold"
              >
                Get Testnet Tokens
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6" style={{ borderTop: "1px solid rgba(139,92,246,0.15)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded og-btn-primary flex items-center justify-center text-xs font-bold">Ø</div>
            <span>AI Payroll · 0G Labs</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://0g.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition">0g.ai</a>
            <a href="https://chainscan-galileo.0g.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition">Explorer</a>
            <a href="https://faucet.0g.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition">Faucet</a>
          </div>
          <span>Chain ID 16602 · Galileo Testnet</span>
        </div>
      </footer>
    </div>
  );
}
