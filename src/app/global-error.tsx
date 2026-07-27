"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset?: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            {error?.message || "An unexpected error occurred. Please try again."}
          </p>
          <button
            type="button"
            onClick={() => reset?.()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
