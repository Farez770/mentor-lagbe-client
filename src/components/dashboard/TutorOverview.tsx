import { BookOpen, BadgeCheck, Users, Sparkles } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

// ============================================================
// DEMO TUTOR DATA (design only — no backend yet).
// TODO (for you, later): replace these values with the real
// logged-in tutor from the BetterAuth session and real numbers
// fetched from the API, for example:
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tuitions/stats`);
// ============================================================
const demoTutor = {
  name: "Rahat Karim", // shown in the "Welcome back" heading
  plan: "Free", // "Free" or "Pro" (requirement: Current Plan card)
};

// ============================================================
// The 4 stats required by the project:
//   1. Total Tuitions Posted
//   2. Active / Approved Tuitions
//   3. Total Applicants Received
//   4. Current Plan: Free / Pro
// Every value below is demo information — UI design only.
// ============================================================
const stats = [
  {
    id: 1,
    label: "Total Tuitions Posted",
    value: "12", // demo: all tuitions this tutor ever posted
    sub: "3 waiting for admin approval",
    dot: "bg-amber-500", // amber dot = something is pending
    accent: "emerald" as const,
    icon: BookOpen,
  },
  {
    id: 2,
    label: "Active / Approved Tuitions",
    value: "8", // demo: approved + active listings
    sub: "67% of your tuitions are live",
    dot: "bg-emerald-500", // green dot = all good
    accent: "teal" as const,
    icon: BadgeCheck,
  },
  {
    id: 3,
    label: "Total Applicants Received",
    value: "47", // demo: students who applied to this tutor's tuitions
    sub: "+9 new applicants this week",
    dot: "bg-teal-500",
    accent: "amber" as const,
    icon: Users,
  },
  {
    id: 4,
    label: "Current Plan",
    value: demoTutor.plan, // "Free" for this demo account
    sub:
      demoTutor.plan === "Free"
        ? "Upgrade to post more tuitions"
        : "Pro benefits are active",
    dot: "bg-rose-500",
    accent: "rose" as const,
    icon: Sparkles,
  },
];

// ============================================================
// Tutor Dashboard — Overview page content:
// welcome header + the 4 reusable stats cards.
// ============================================================
export default function TutorOverview() {
  return (
    <section className="bg-slate-50 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4">
        {/* ====================================================
            WELCOME HEADER (green gradient banner)
            ==================================================== */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 md:p-8 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-6">
            {/* Greeting text */}
            <div>
              {/* Small eyebrow label above the heading */}
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                Tutor Dashboard
              </span>
              {/* Demo name — later this comes from the session user */}
              <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">
                Welcome back, {demoTutor.name}! 👋
              </h1>
              <p className="mt-2 text-sm md:text-base text-emerald-50">
                Here is a quick overview of your tuition listings and
                applicants.
              </p>
            </div>

            {/* Demo avatar — first letter of the tutor's name */}
            <span className="hidden sm:flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/30 bg-white/15 text-2xl font-extrabold">
              {demoTutor.name.charAt(0)}
            </span>
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
                stat.label === "Current Plan" && demoTutor.plan === "Free" ? (
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
    </section>
  );
}
