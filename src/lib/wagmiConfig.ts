"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const ogGalileo = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "A0GI", symbol: "A0GI", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: {
      name: "0G Chain Scan",
      url: "https://chainscan-galileo.0g.ai",
    },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "AI Payroll – 0G Labs",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
  chains: [ogGalileo],
  ssr: false,
});
