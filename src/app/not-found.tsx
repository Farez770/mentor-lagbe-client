import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-7xl font-extrabold text-emerald-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-[#173D32] sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        Back to Home
      </Link>
    </main>
  );
}
