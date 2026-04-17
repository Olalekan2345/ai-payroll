"use client";

interface Props {
  hash?: `0x${string}`;
  isPending?: boolean;
  isConfirming?: boolean;
  isSuccess?: boolean;
  error?: Error | null;
  label?: string;
}

export default function TxStatus({ hash, isPending, isConfirming, isSuccess, error, label = "Transaction" }: Props) {
  if (!hash && !isPending && !error) return null;

  return (
    <div className="mt-3 p-3 rounded-xl og-card text-sm">
      {isPending && (
        <p className="text-amber-400 flex items-center gap-2">
          <span className="animate-spin inline-block">⏳</span> Waiting for wallet confirmation…
        </p>
      )}
      {isConfirming && (
        <p className="og-gradient-text flex items-center gap-2">
          <span className="animate-pulse inline-block">🔄</span> {label} confirming on-chain…
        </p>
      )}
      {isSuccess && (
        <div>
          <p className="text-emerald-400">✅ {label} confirmed!</p>
          {hash && (
            <a
              href={`https://chainscan-galileo.0g.ai/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline mt-1 block break-all transition"
            >
              View on Explorer → {hash}
            </a>
          )}
        </div>
      )}
      {error && (
        <p className="text-red-400">
          ❌ Error: {(error as { shortMessage?: string })?.shortMessage || error.message}
        </p>
      )}
    </div>
  );
}
