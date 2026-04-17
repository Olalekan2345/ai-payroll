"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-gray-950 flex items-center justify-center text-center p-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-gray-400 mb-6">{error.message}</p>
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
