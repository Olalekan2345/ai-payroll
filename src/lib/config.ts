// 0G Galileo Testnet configuration
export const OG_GALILEO = {
  id: 16602,
  name: "0G-Galileo-Testnet",
  nativeCurrency: { name: "A0GI", symbol: "A0GI", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc-testnet.0g.ai"] },
    public: { http: ["https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: {
      name: "0G Explorer",
      url: "https://chainscan-galileo.0g.ai",
    },
  },
  testnet: true,
} as const;

// 0G Storage & Indexer nodes (Galileo testnet)
export const OG_STORAGE_RPC = "https://evmrpc-testnet.0g.ai";
export const OG_INDEXER_RPC = "https://indexer-storage-testnet-turbo.0g.ai";

// Contract address — set after deployment, or read from env
export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

// Pay rate: 1 A0GI per hour (in wei)
export const HOURLY_RATE_WEI = BigInt("1000000000000000000"); // 1e18

export const FAUCET_URL = "https://faucet.0g.ai";
