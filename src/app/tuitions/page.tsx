import type { Metadata } from "next";
import { Suspense } from "react";
import BrowseTuitions from "@/components/tuitions/BrowseTuitions";

export const metadata: Metadata = {
  title: "Browse Tuitions | MentorLagbe",
  description:
    "Search and filter live tuition listings by subject, class level and mode.",
};

export default function TuitionsPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-slate-50" />}>
      <BrowseTuitions />
    </Suspense>
  );
}
