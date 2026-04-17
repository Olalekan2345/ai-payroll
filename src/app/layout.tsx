// Force all pages to be dynamic — required with wagmi/RainbowKit in App Router
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Payroll – 0G Labs",
  description: "Decentralized AI-powered payroll on 0G Galileo Testnet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){try{var t=localStorage.getItem('og-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();
        `}} />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
