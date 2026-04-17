"use client";

import dynamic from "next/dynamic";

// Dynamically import the actual providers — never renders on server
const Web3Providers = dynamic(() => import("./Web3Providers"), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
  return <Web3Providers>{children}</Web3Providers>;
}
