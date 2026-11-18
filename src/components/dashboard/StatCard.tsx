import type { LucideIcon } from "lucide-react";
import FadeIn from "@/components/shared/FadeIn";

// ============================================================
// Full class-name maps for each accent color.
// WHY a map instead of writing bg-${accent}-100 inside the card:
// Tailwind only generates classes it can SEE as plain text in the
// source code. Dynamic names like `bg-emerald-100` built with
// template strings would be missing from the final CSS!
// ============================================================
const accents = {
  emerald: {
    icon: "bg-emerald-100 text-emerald-600",
    value: "text-emerald-600",
  },
  teal: {
    icon: "bg-teal-100 text-teal-600",
    value: "text-teal-600",
  },
  amber: {
    icon: "bg-amber-100 text-amber-600",
    value: "text-amber-600",
  },
  rose: {
    icon: "bg-rose-100 text-rose-600",
    value: "text-rose-600",
  },
};

// Which color family this card uses
type Accent = keyof typeof accents;

// ============================================================
// StatCard — ONE reusable dashboard stats card.
// The tutor overview shows 4 of these; later the student and
// admin dashboards can reuse the exact same component.
// ============================================================
export default function StatCard({
  icon: Icon, // the lucide icon component (renamed so we can use <Icon />)
  label, // small title, e.g. "Total Tuitions Posted"
  value, // big number, e.g. "12"
  sub, // small helper text under the number
  dot, // full tailwind class for the little colored dot in front of `sub`
  accent, // color family: "emerald" | "teal" | "amber" | "rose"
  action, // optional extra element (only the Plan card uses this)
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  dot: string;
  accent: Accent;
  action?: React.ReactNode;
}) {
  return (
    <FadeIn className="h-full">
      <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-start justify-between gap-3">
          {/* ---- Left side: label, big value, helper text ---- */}
          <div className="min-w-0">
            {/* Card title */}
            <p className="text-sm font-semibold text-slate-500">{label}</p>

            {/* Big value in the card's accent color */}
            <p className={`mt-2 text-3xl font-extrabold ${accents[accent].value}`}>
              {value}
            </p>

            {/* Helper line with a small colored dot */}
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
              {sub}
            </p>

            {/* Optional action (the "Upgrade to Pro" button) */}
            {action && <div className="mt-3">{action}</div>}
          </div>

          {/* ---- Right side: icon in a soft colored square ---- */}
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accents[accent].icon}`}
          >
            <Icon className="h-6 w-6" />
          </span>
        </div>
      </div>
    </FadeIn>
  );
}
