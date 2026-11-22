"use client";

// "use client" is needed because this page passes icon
// COMPONENTS (functions) to DashboardDrawer, and only client
// components may receive functions as props.
import { ClipboardList, CreditCard, GraduationCap, Users } from "lucide-react";
import { StatCardsSkeleton } from "@/components/shared/Loading"; // skeleton cards while stats load
import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
// The sidebar sections + demo admin are shared with the other
// admin pages — see adminData.ts
import { adminSections, demoAdmin } from "@/components/dashboard/adminData";
import { authClient } from "@/lib/auth-client";
import { getAdminStats, type AdminStats } from "@/lib/api/admin";

// ============================================================
// ADMIN DASHBOARD — Overview page (/dashboard/admin)
//
// Project requirement — 4 reusable stats cards:
//   1. Total Users                 -> GET /api/admin/stats
//   2. Total Tutors                -> GET /api/admin/stats
//   3. Pending vs. Approved Tuitions -> GET /api/admin/stats
//   4. Total Stripe Revenue        -> GET /api/admin/stats
//
// The API only answers admins (403 for everyone else), so a
// non-admin sees the error card below instead of fake numbers.
// ============================================================
export default function AdminOverview() {
  // ============================================================
  // THE REAL LOGGED-IN USER (BetterAuth session)
  // ============================================================
  const { data: session } = authClient.useSession();
  const displayName = session?.user?.name ?? demoAdmin.name;
  const displayImage = session?.user?.image || undefined;

  // ============================================================
  // THE REAL NUMBERS (GET /api/admin/stats).
  // null = still loading -> the cards show "…".
  // loadError = the server said no (403 for non-admins, API
  // down, ...) -> we show an error card, never fake data.
  // ============================================================
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    getAdminStats()
      .then((data) => {
        if (!alive) return;
        setStatsData(data.stats);
        setLoadError(false);
      })
      .catch((err) => {
        console.warn("Could not load platform stats:", err);
        if (!alive) return;
        setLoadError(true);
        setStatsData(null);
      });

    // cleanup: never set state after unmount
    return () => {
      alive = false;
    };
  }, []); // [] = run once when the page opens

  // Shortcuts to the loaded numbers (undefined while loading)
  const totalUsers = statsData?.totalUsers;
  const totalTutors = statsData?.totalTutors;
  const pending = statsData?.pendingTuitions;
  const approved = statsData?.approvedTuitions;
  const revenue = statsData?.totalRevenue;

  // The 4 cards required by the requirement, from REAL numbers
  const stats = [
    {
      id: 1,
      label: "Total Users",
      value: totalUsers === undefined ? "…" : String(totalUsers),
      sub:
        totalUsers === undefined
          ? "Loading platform stats…"
          : totalUsers > 0
            ? "Registered accounts"
            : "No users yet",
      dot: totalUsers ? "bg-emerald-500" : "bg-slate-400",
      accent: "emerald" as const,
      icon: Users,
    },
    {
      id: 2,
      label: "Total Tutors",
      value: totalTutors === undefined ? "…" : String(totalTutors),
      sub:
        totalTutors === undefined
          ? "Loading platform stats…"
          : totalTutors > 0
            ? "Teaching on the platform"
            : "No tutors yet",
      dot: totalTutors ? "bg-teal-500" : "bg-slate-400",
      accent: "teal" as const,
      icon: GraduationCap,
    },
    {
      id: 3,
      label: "Pending vs. Approved",
      // e.g. "3 / 12" — pending first, approved second
      value: pending === undefined ? "…" : `${pending} / ${approved}`,
      sub:
        pending === undefined
          ? "Loading platform stats…"
          : "pending / approved tuitions",
      // amber dot = something is waiting for approval
      dot: pending ? "bg-amber-500" : "bg-slate-400",
      accent: "amber" as const,
      icon: ClipboardList,
    },
    {
      id: 4,
      // Stripe charges in USD ($10 / $15 cards) — value is in
      // whole dollars, exactly what /api/payments/verify stores
      label: "Total Stripe Revenue",
      value: revenue === undefined ? "…" : `$${revenue.toLocaleString()}`,
      sub:
        revenue === undefined
          ? "Loading platform stats…"
          : revenue > 0
            ? "Collected via Stripe"
            : "No payments yet — pricing coming soon",
      dot: revenue ? "bg-emerald-500" : "bg-slate-400",
      accent: "rose" as const,
      icon: CreditCard,
    },
  ];

  return (
    // No top padding — the content starts flush at the very
    // top of the right column. pb-6 only leaves a little
    // breathing room at the bottom when you scroll to the end.
    <section className="bg-slate-50 pb-6">
      {/* ====================================================
          DashboardDrawer = the dashboard SHELL (sidebar + the
          only scrollable area). On dashboard pages the site
          navbar and footer are hidden (Navbar/Footer return
          null on /dashboard/*), so the shell fills the screen.
          ==================================================== */}
      <DashboardDrawer
        title="Admin Dashboard"
        sections={adminSections}
        // Fallback user shown for a moment while the session
        // loads — the drawer swaps in the REAL logged-in admin.
        user={{
          name: demoAdmin.name,
          role: "Admin",
          plan: demoAdmin.plan,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 mt-12">
          {/* ====================================================
              WELCOME HEADER (same green banner as the other
              dashboard overviews)
              ==================================================== */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-6 px-7">
              {/* Greeting text */}
              <div>
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                  Admin Dashboard
                </span>
                {/* Real name from the session (demo until it loads) */}
                <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">
                  Welcome back, {displayName}! 👋
                </h1>
                <p className="mt-2 text-sm md:text-base text-emerald-50">
                  Platform health at a glance — users, tuitions and revenue.
                </p>
              </div>

              {/* Real profile photo — falls back to the first letter */}
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- profile photos can come from any domain
                <img
                  src={displayImage}
                  alt={displayName}
                  className="hidden h-16 w-16 rounded-full border-4 border-white/30 object-cover sm:block"
                />
              ) : (
                <span className="hidden h-16 w-16 items-center justify-center rounded-full border-4 border-white/30 bg-white/15 text-2xl font-extrabold sm:flex">
                  {displayName.charAt(0)}
                </span>
              )}
            </div>
          </div>

          {/* ====================================================
              1) ERROR — not an admin (403), or API not reachable
              ==================================================== */}
          {loadError ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                Could not load platform stats
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                This page is for admin accounts only. Check that you&apos;re
                signed in as an admin and that the API server is running, then
                try again.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 cursor-pointer rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          ) : !statsData ? (
            /* Skeleton cards while GET /api/admin/stats loads */
            <div className="mt-6">
              <StatCardsSkeleton />
            </div>
          ) : (
            /* ====================================================
                2) STATS GRID — the 4 required cards.
                1 column on mobile, 2 on tablet, 4 on desktop.
                ==================================================== */
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <StatCard
                  key={stat.id}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  sub={stat.sub}
                  dot={stat.dot}
                  accent={stat.accent}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardDrawer>
    </section>
  );
}
