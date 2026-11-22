"use client";

import { ClipboardList, CreditCard, GraduationCap, Users } from "lucide-react";
import { StatCardsSkeleton } from "@/components/shared/Loading";
import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { adminSections, demoAdmin } from "@/components/dashboard/adminData";
import { authClient } from "@/lib/auth-client";
import { getAdminStats, type AdminStats } from "@/lib/api/admin";

export default function AdminOverview() {
  const { data: session } = authClient.useSession();
  const displayName = session?.user?.name ?? demoAdmin.name;
  const displayImage = session?.user?.image || undefined;

  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
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

    return () => {
      alive = false;
    };
  }, []);

  const totalUsers = statsData?.totalUsers;
  const totalTutors = statsData?.totalTutors;
  const pending = statsData?.pendingTuitions;
  const approved = statsData?.approvedTuitions;
  const revenue = statsData?.totalRevenue;

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
      value: pending === undefined ? "…" : `${pending} / ${approved}`,
      sub:
        pending === undefined
          ? "Loading platform stats…"
          : "pending / approved tuitions",
      dot: pending ? "bg-amber-500" : "bg-slate-400",
      accent: "amber" as const,
      icon: ClipboardList,
    },
    {
      id: 4,
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
    <section className="bg-slate-50 pb-6">
      <DashboardDrawer
        title="Admin Dashboard"
        sections={adminSections}
        user={{
          name: demoAdmin.name,
          role: "Admin",
          plan: demoAdmin.plan,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 mt-12">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-6 px-7">
              <div>
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                  Admin Dashboard
                </span>
                <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">
                  Welcome back, {displayName}! 👋
                </h1>
                <p className="mt-2 text-sm md:text-base text-emerald-50">
                  Platform health at a glance — users, tuitions and revenue.
                </p>
              </div>

              {displayImage ? (
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
