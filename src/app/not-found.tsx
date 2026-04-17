export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center p-4">
      <div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-400 mb-6">Page not found.</p>
        <a href="/" className="text-blue-400 hover:underline" rel="noopener noreferrer">← Go home</a>
      </div>
    </div>
  );
}
