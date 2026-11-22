"use client";

// "use client" is needed because this page passes icon
// COMPONENTS (functions) to DashboardDrawer, and only client
// components may receive functions as props.
import { Send, BadgeCheck, Clock, Sparkles } from "lucide-react";
import { StatCardsSkeleton } from "@/components/shared/Loading"; // skeleton cards while stats load
import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
// The sidebar sections + demo student are shared with the
// other student pages — see studentData.ts
import {
  demoStudent,
  studentSections,
} from "@/components/dashboard/studentData";
import { authClient } from "@/lib/auth-client";
import { getStudentStats, type StudentStats } from "@/lib/api/applications";

// ============================================================
// STUDENT DASHBOARD — Overview page (/dashboard/student)
//
// Project requirement — 4 reusable stats cards:
//   1. Total Applied Tuitions  -> GET /api/applications/stats
//   2. Accepted Applications   -> GET /api/applications/stats
//   3. Pending Applications    -> GET /api/applications/stats
//   4. Current Plan: Free/Pro  -> the real session plan
//
// No hardcoded demo numbers: the 3 counts come from the API
// and the plan comes from the BetterAuth session.
// ============================================================
export default function StudentOverview() {
  // ============================================================
  // THE REAL LOGGED-IN STUDENT (BetterAuth session).
  // Every useSession() call shares ONE cached request — the
  // drawer + navbar already ask for it, so this is free.
  // ============================================================
  const { data: session } = authClient.useSession();
  const displayName = session?.user?.name ?? demoStudent.name;
  const displayImage = session?.user?.image || undefined;

  // ============================================================
  // THE REAL NUMBERS (GET /api/applications/stats).
  // null = still loading → the cards show "…" until the API
  // answers. If the request fails we show zeros instead.
  // ============================================================
  const [statsData, setStatsData] = useState<StudentStats | null>(null);

  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    getStudentStats()
      .then((data) => {
        if (alive) setStatsData(data.stats);
      })
      .catch((err) => {
        // e.g. API server not running, or not signed in
        console.warn("Could not load application stats:", err);
        if (alive) {
          setStatsData({
            totalApplied: 0,
            accepted: 0,
            pending: 0,
            plan: "free",
          });
        }
      });

    // cleanup: never set state after unmount
    return () => {
      alive = false;
    };
  }, []); // [] = run once when the page opens

  // Shortcuts to the loaded numbers (undefined while loading)
  const total = statsData?.totalApplied;
  const accepted = statsData?.accepted;
  const pending = statsData?.pending;

  // The session stores the plan lowercase ("free"/"pro") —
  // the card needs the display form ("Free"/"Pro").
  // The demo value is only a fallback while the session loads.
  const plan =
    String(session?.user?.plan ?? demoStudent.plan).toLowerCase() === "pro"
      ? "Pro"
      : "Free";

  // The 4 cards required by the requirement, from REAL numbers
  const stats = [
    {
      id: 1,
      label: "Total Applied Tuitions",
      value: total === undefined ? "…" : String(total),
      sub:
        total === undefined
          ? "Loading your applications…"
          : total > 0
            ? "Your applications so far"
            : "You have not applied yet",
      dot: total ? "bg-emerald-500" : "bg-slate-400",
      accent: "emerald" as const,
      icon: Send,
    },
    {
      id: 2,
      label: "Accepted Applications",
      value: accepted === undefined ? "…" : String(accepted),
      sub:
        accepted === undefined
          ? "Loading your applications…"
          : accepted > 0
            ? "Tutors who accepted you"
            : "No acceptances yet",
      dot: accepted ? "bg-emerald-500" : "bg-slate-400",
      accent: "teal" as const,
      icon: BadgeCheck,
    },
    {
      id: 3,
      label: "Pending Applications",
      value: pending === undefined ? "…" : String(pending),
      sub:
        pending === undefined
          ? "Loading your applications…"
          : pending > 0
            ? "Waiting for the tutor's reply"
            : "Nothing waiting right now",
      // amber dot = something is waiting
      dot: pending ? "bg-amber-500" : "bg-slate-400",
      accent: "amber" as const,
      icon: Clock,
    },
    {
      id: 4,
      label: "Current Plan",
      value: plan, // real plan from the session (Free/Pro)
      sub:
        plan === "Free"
          ? "You are on the Free plan"
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
          hidden (Navbar/Footer return null on /dashboard/*),
          so the shell fills the whole screen.
          ==================================================== */}
      <DashboardDrawer
        title="Student Dashboard"
        sections={studentSections}
        // Fallback user shown for a moment while the session
        // loads — the drawer swaps in the REAL logged-in student
        // (name, role, plan, photo) automatically.
        user={{
          name: demoStudent.name,
          role: "Student",
          plan: demoStudent.plan,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 mt-12">
          {/* ====================================================
              WELCOME HEADER (green gradient banner — same
              design as the tutor overview)
              ==================================================== */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-6 px-7">
              {/* Greeting text */}
              <div>
                {/* Small eyebrow label above the heading */}
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                  Student Dashboard
                </span>
                {/* Real name from the session (demo until it loads) */}
                <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">
                  Welcome back, {displayName}! 👋
                </h1>
                <p className="mt-2 text-sm md:text-base text-emerald-50">
                  Track the tuitions you applied to and what the tutors decided.
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
              While the stats API call is in flight, show 4
              pulsing placeholder cards instead of "…" text.
              ==================================================== */}
          {statsData === null ? (
            <div className="mt-6">
              <StatCardsSkeleton />
            </div>
          ) : (
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
