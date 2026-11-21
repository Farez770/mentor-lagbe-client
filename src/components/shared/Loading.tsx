// ============================================================
// LOADING UI — shared by the route-level loading.tsx files AND
// by the client components that fetch data in useEffect.
//
// Two kinds of feedback (both are "custom" to our app):
//   1. LoadingSpinner — a spinner + label used while a page's
//      data request is in flight (replaces 10 copy-pasted blocks)
//   2. Skeleton blocks — grey, gently pulsing shapes that look
//      like the real content, used by loading.tsx so navigation
//      feels instant and "smooth" (no blank white screen)
//
// This file is a plain PRESENTATIONAL component (no hooks, no
// "use client") — it can be imported by Server Components
// (loading.tsx) and by Client Components (dashboards) alike.
// ============================================================
import { Loader2 } from "lucide-react";

// ---------- 1) THE SPINNER ----------
// Drop-in replacement for "a Loader2 + a <p>" wherever data is
// loading. role="status" + aria-live lets screen readers know.
export function LoadingSpinner({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 text-slate-500 ${
        compact ? "py-10" : "py-16"
      }`}
    >
      <Loader2
        className="h-8 w-8 animate-spin text-emerald-600"
        aria-hidden="true"
      />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

// ---------- 2) SKELETON BUILDING BLOCK ----------
// animate-pulse gives the soft "breathing" shimmer. aria-hidden
// because it carries no information for assistive technology.
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-slate-200 ${className}`}
    />
  );
}

// One tuition card placeholder (banner + title + details)
export function TuitionCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-emerald-950/5"
    >
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// A grid of tuition card placeholders (Browse / Featured shape)
export function TuitionGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <TuitionCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Full-page skeleton for public data pages (home / browse)
export function PageSkeleton() {
  return (
    <div className="bg-slate-50 pb-16" aria-label="Loading page">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {/* heading area */}
        <div className="space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-2/3 max-w-lg" />
          <Skeleton className="h-4 w-1/2 max-w-xl" />
        </div>
        {/* search + filter bar */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Skeleton className="h-11 w-72 max-w-full" />
          <Skeleton className="h-11 w-40" />
          <Skeleton className="h-11 w-40" />
        </div>
        {/* the tuition grid */}
        <div className="mt-10">
          <TuitionGridSkeleton />
        </div>
      </div>
    </div>
  );
}

// Skeleton for /tuitions/[id] (banner + text + apply sidebar)
export function TuitionDetailsSkeleton() {
  return (
    <div className="bg-slate-50 pb-16" aria-label="Loading tuition details">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-32" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* left: the big banner + description */}
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          {/* right: the sticky "Bookmark / Apply" card */}
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-emerald-950/5">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Four stat-card placeholders (the shape of every Overview page)
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="space-y-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-emerald-950/5"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

// Generic list-row placeholder (applications, users, transactions…)
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul aria-hidden="true" className="space-y-4">
      {Array.from({ length: rows }, (_, index) => (
        <li
          key={index}
          className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-emerald-950/5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Full dashboard skeleton — mirrors DashboardDrawer's sidebar +
// content column so navigating between dashboards looks smooth.
// (dashboard/loading.tsx wraps ALL admin/tutor/student routes.)
export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-slate-50" aria-label="Loading dashboard">
      {/* left sidebar placeholder */}
      <aside className="hidden w-64 shrink-0 space-y-3 border-r border-emerald-950/5 bg-white p-5 lg:block">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-3 pt-8">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </aside>
      {/* right content column */}
      <main className="flex-1 p-6 sm:p-8">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="mt-8">
          <StatCardsSkeleton />
        </div>
        <div className="mt-8">
          <ListSkeleton rows={3} />
        </div>
      </main>
    </div>
  );
}

// Pricing page skeleton (4 plan cards in 2 groups)
export function PricingSkeleton() {
  return (
    <div className="bg-slate-50 pb-20" aria-label="Loading plans">
      <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-8 w-72 max-w-full" />
          <Skeleton className="mx-auto h-4 w-96 max-w-full" />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-950/5"
            >
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
