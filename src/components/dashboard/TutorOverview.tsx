"use client";

// "use client" is needed because this page passes icon COMPONENTS
// (functions) to DashboardDrawer, and only client components may
// receive functions as props.
import { BookOpen, BadgeCheck, Users, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
// The sidebar sections + demo tutor are shared with the other
// tutor pages (Post a Tuition, My Tuitions, ...) — see tutorData.ts
import { demoTutor, tutorSections } from "@/components/dashboard/tutorData";
import { authClient } from "@/lib/auth-client";
import { getTuitionStats, type TutorStats } from "@/lib/api/tuitions";

// ============================================================
// The 4 stats required by the project:
//   1. Total Tuitions Posted      -> GET /api/tuitions/stats
//   2. Active / Approved Tuitions -> GET /api/tuitions/stats
//   3. Total Applicants Received  -> GET /api/tuitions/stats
//      (REAL count since 2026-11-21 — it used to be a
//      hardcoded 0 with a TODO; the server now counts the
//      "applications" collection for this tutor)
//   4. Current Plan               -> the real session plan
// The numbers are fetched inside the component below — this
// file no longer has any hardcoded demo values.
// ============================================================

// ============================================================
// Tutor Dashboard — Overview page content:
// welcome header + the 4 reusable stats cards.
// Everything is wrapped in <DashboardDrawer> — the shell with
// the fixed-height aside; this content lives in the scrollable
// right column (the site navbar + footer are hidden here).
// ============================================================
export default function TutorOverview() {
  // ============================================================
  // THE REAL LOGGED-IN USER (BetterAuth session).
  // Every useSession() call in the app shares ONE cached
  // request — the drawer + navbar already ask for it, so this
  // is free. The greeting and avatar show the real name/photo.
  // ============================================================
  const { data: session } = authClient.useSession();
  const displayName = session?.user?.name ?? demoTutor.name;
  const displayImage = session?.user?.image || undefined;

  // ============================================================
  // THE REAL NUMBERS (GET /api/tuitions/stats).
  // null = still loading → the cards show "…" until the API
  // answers. If the request fails we show zeros instead.
  // ============================================================
  const [statsData, setStatsData] = useState<TutorStats | null>(null);

  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    getTuitionStats()
      .then((data) => {
        if (alive) setStatsData(data);
      })
      .catch((err) => {
        // e.g. API server not running, or not signed in
        console.warn("Could not load tuition stats:", err);
        if (alive) {
          setStatsData({ total: 0, approved: 0, pending: 0, applicants: 0 });
        }
      });

    // cleanup: never set state after unmount
    return () => {
      alive = false;
    };
  }, []); // [] = run once when the page opens

  // Shortcuts to the loaded numbers (undefined while loading)
  const total = statsData?.total;
  const approved = statsData?.approved;
  const pending = statsData?.pending;
  const applicants = statsData?.applicants;

  // What % of this tutor's tuitions are live right now
  // (guard against dividing by zero when total is 0/undefined)
  const livePercent =
    total && total > 0 ? Math.round(((approved ?? 0) / total) * 100) : 0;

  // The session stores the plan lowercase ("free"/"pro") —
  // the card needs the display form ("Free"/"Pro").
  // The demo value is only a fallback while the session loads.
  const plan =
    String(session?.user?.plan ?? demoTutor.plan).toLowerCase() === "pro"
      ? "Pro"
      : "Free";

  // The 4 cards, built from the REAL numbers above
  const stats = [
    {
      id: 1,
      label: "Total Tuitions Posted",
      value: total === undefined ? "…" : String(total),
      sub:
        pending === undefined
          ? "Loading your tuitions…"
          : pending > 0
            ? `${pending} waiting for admin approval`
            : "Nothing waiting for approval",
      // amber dot = something is pending
      dot: pending ? "bg-amber-500" : "bg-emerald-500",
      accent: "emerald" as const,
      icon: BookOpen,
    },
    {
      id: 2,
      label: "Active / Approved Tuitions",
      value: approved === undefined ? "…" : String(approved),
      sub:
        approved === undefined
          ? "Loading your tuitions…"
          : approved > 0
            ? `${livePercent}% of your tuitions are live`
            : total && total > 0
              ? "Waiting for admin approval"
              : "Post your first tuition to see it here",
      dot: approved ? "bg-emerald-500" : "bg-amber-500",
      accent: "teal" as const,
      icon: BadgeCheck,
    },
    {
      id: 3,
      label: "Total Applicants Received",
      value: applicants === undefined ? "…" : String(applicants),
      // REAL count since 2026-11-21 (see GET /api/tuitions/stats)
      sub:
        applicants === undefined
          ? "Loading your applicants…"
          : applicants > 0
            ? `${applicants} ${applicants === 1 ? "student has" : "students have"} applied`
            : "No applications yet",
      dot: applicants ? "bg-emerald-500" : "bg-teal-500",
      accent: "amber" as const,
      icon: Users,
    },
    {
      id: 4,
      label: "Current Plan",
      value: plan, // real plan from the session (Free/Pro)
      sub:
        plan === "Free"
          ? "Upgrade to post more tuitions"
          : "Pro benefits are active",
      dot: "bg-rose-500",
      accent: "rose" as const,
      icon: Sparkles,
    },
  ];

  return (
    // No top padding — the content starts flush at the very
    // top of the right column. pb-6 only leaves a little
    // breathing room at the bottom when you scroll to the end.
    <section className="bg-slate-50 pb-6">
      {/* ====================================================
          DashboardDrawer = the dashboard SHELL:
            - left <aside> sidebar with a fixed height that
              never moves
            - right column = the ONLY scrollable area; it
              shows this page content and changes when the
              route changes
          On dashboard pages the site navbar and footer are
          hidden (see the :has() rule in globals.css), so the
          shell fills the whole screen — body never scrolls.
          ==================================================== */}
      <DashboardDrawer
        title="Tutor Dashboard"
        sections={tutorSections}
        // Fallback user shown for a moment while the session
        // loads — the drawer swaps in the REAL logged-in user
        // (name, role, plan, photo) automatically.
        user={{ name: demoTutor.name, role: "Tutor", plan: demoTutor.plan }}
      >
        <div className="max-w-7xl mx-auto px-4 mt-16">
          {/* ====================================================
              WELCOME HEADER (green gradient banner)
              py-6 = a small, tidy gap below the navbar
              (the old py-10 / md:py-14 looked too airy)
              ==================================================== */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-6 px-7">
              {/* Greeting text */}
              <div>
                {/* Small eyebrow label above the heading */}
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                  Tutor Dashboard
                </span>
                {/* Real name from the session (demo until it loads) */}
                <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">
                  Welcome back, {displayName}! 👋
                </h1>
                <p className="mt-2 text-sm md:text-base text-emerald-50">
                  Here is a quick overview of your tuition listings and
                  applicants.
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
              STATS GRID — the 4 required cards.
              1 column on mobile, 2 on tablet, 4 on desktop.
              ==================================================== */}
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
                // Only the Plan card gets the Upgrade button
                action={
                  stat.label === "Current Plan" && plan === "Free" ? (
                    // TODO (for you, later): wire this button to the
                    // Pro payment flow (payments collection) later.

                    <button
                      type="button"
                      className="w-full cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-600"
                    >
                      ⭐ Upgrade to Pro
                    </button>
                  ) : undefined
                }
              />
            ))}
          </div>
        </div>
      </DashboardDrawer>
    </section>
  );
}
