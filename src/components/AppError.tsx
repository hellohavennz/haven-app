export default function AppError({ error }: { error: unknown }) {
  console.error(error);
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="font-semibold mb-2">Something went wrong</h1>
      <p className="text-gray-600">Please refresh the page. If the problem continues, we'll fix it quickly.</p>
      <pre className="mt-4 text-small bg-gray-50 p-3 rounded border overflow-auto">{String(error)}</pre>
    </div>
  );
}
