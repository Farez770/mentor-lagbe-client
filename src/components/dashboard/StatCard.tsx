import type { LucideIcon } from "lucide-react";
import FadeIn from "@/components/shared/FadeIn";

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

type Accent = keyof typeof accents;

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  dot,
  accent,
  action,
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
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-500">{label}</p>

            <p className={`mt-2 text-3xl font-extrabold ${accents[accent].value}`}>
              {value}
            </p>

            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
              {sub}
            </p>

            {action && <div className="mt-3">{action}</div>}
          </div>

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
