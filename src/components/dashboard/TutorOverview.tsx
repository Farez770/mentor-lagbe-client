"use client";

import { BookOpen, BadgeCheck, Users, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCardsSkeleton } from "@/components/shared/Loading";
import StatCard from "@/components/dashboard/StatCard";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { demoTutor, tutorSections } from "@/components/dashboard/tutorData";
import { authClient } from "@/lib/auth-client";
import { getTuitionStats, type TutorStats } from "@/lib/api/tuitions";


export default function TutorOverview() {
  const { data: session } = authClient.useSession();
  const displayName = session?.user?.name ?? demoTutor.name;
  const displayImage = session?.user?.image || undefined;

  const [statsData, setStatsData] = useState<TutorStats | null>(null);

  useEffect(() => {
    let alive = true;

    getTuitionStats()
      .then((data) => {
        if (alive) setStatsData(data);
      })
      .catch((err) => {
        console.warn("Could not load tuition stats:", err);
        if (alive) {
          setStatsData({ total: 0, approved: 0, pending: 0, applicants: 0 });
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  const total = statsData?.total;
  const approved = statsData?.approved;
  const pending = statsData?.pending;
  const applicants = statsData?.applicants;

  const livePercent =
    total && total > 0 ? Math.round(((approved ?? 0) / total) * 100) : 0;

  const plan =
    String(session?.user?.plan ?? demoTutor.plan).toLowerCase() === "pro"
      ? "Pro"
      : "Free";

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
    <section className="bg-slate-50 pb-6">
      <DashboardDrawer
        title="Tutor Dashboard"
        sections={tutorSections}
        user={{ name: demoTutor.name, role: "Tutor", plan: demoTutor.plan }}
      >
        <div className="max-w-7xl mx-auto px-4 mt-12">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-6 px-7">
              <div>
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                  Tutor Dashboard
                </span>
                <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">
                  Welcome back, {displayName}! 👋
                </h1>
                <p className="mt-2 text-sm md:text-base text-emerald-50">
                  Here is a quick overview of your tuition listings and
                  applicants.
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
                  action={
                    stat.label === "Current Plan" && plan === "Free" ? (
                      <Link
                        href="/pricing"
                        className="block w-full rounded-lg bg-amber-500 px-4 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-amber-600"
                      >
                        ⭐ Upgrade to Pro
                      </Link>
                    ) : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </DashboardDrawer>
    </section>
  );
}
