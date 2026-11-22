"use client";

import { Send, BadgeCheck, Clock, Sparkles } from "lucide-react";
import { StatCardsSkeleton } from "@/components/shared/Loading";
import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import {
  demoStudent,
  studentSections,
} from "@/components/dashboard/studentData";
import { authClient } from "@/lib/auth-client";
import { getStudentStats, type StudentStats } from "@/lib/api/applications";

export default function StudentOverview() {
  const { data: session } = authClient.useSession();
  const displayName = session?.user?.name ?? demoStudent.name;
  const displayImage = session?.user?.image || undefined;

  const [statsData, setStatsData] = useState<StudentStats | null>(null);

  useEffect(() => {
    let alive = true;

    getStudentStats()
      .then((data) => {
        if (alive) setStatsData(data.stats);
      })
      .catch((err) => {
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

    return () => {
      alive = false;
    };
  }, []);

  const total = statsData?.totalApplied;
  const accepted = statsData?.accepted;
  const pending = statsData?.pending;

  const plan =
    String(session?.user?.plan ?? demoStudent.plan).toLowerCase() === "pro"
      ? "Pro"
      : "Free";

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
      dot: pending ? "bg-amber-500" : "bg-slate-400",
      accent: "amber" as const,
      icon: Clock,
    },
    {
      id: 4,
      label: "Current Plan",
      value: plan,
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
    <section className="bg-slate-50 pb-6">
      <DashboardDrawer
        title="Student Dashboard"
        sections={studentSections}
        user={{
          name: demoStudent.name,
          role: "Student",
          plan: demoStudent.plan,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 mt-12">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-6 px-7">
              <div>
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                  Student Dashboard
                </span>
                <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">
                  Welcome back, {displayName}! 👋
                </h1>
                <p className="mt-2 text-sm md:text-base text-emerald-50">
                  Track the tuitions you applied to and what the tutors decided.
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
