"use client";

import Link from "next/link";

// Error boundary — shown when a page crashes while rendering.
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-6xl">😕</p>
      <h1 className="mt-4 text-2xl font-bold text-[#173D32] sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        We could not load this page. Please try again or return to the home page.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-lg border border-emerald-600 px-6 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
