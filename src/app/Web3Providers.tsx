"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { ogGalileo } from "@/lib/wagmiConfig";
import { createStorage } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const wagmiConfig = getDefaultConfig({
  appName: "AI Payroll – 0G Labs",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
  chains: [ogGalileo],
  ssr: false,
  storage: createStorage({ storage: window.localStorage }),
});

export default function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#3b82f6",
            accentColorForeground: "white",
            borderRadius: "large",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
