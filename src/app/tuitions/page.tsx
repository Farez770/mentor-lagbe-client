import type { Metadata } from "next";
import { Suspense } from "react";
import BrowseTuitions from "@/components/tuitions/BrowseTuitions";

// Title + description for this page (shown in the browser tab
// and used by search engines)
export const metadata: Metadata = {
  title: "Browse Tuitions | MentorLagbe",
  description:
    "Search and filter live tuition listings by subject, class level and mode.",
};

// The /tuitions page.
// The layout already adds the Navbar and Footer around it,
// so this file only renders the browse content.
//
// CHALLENGE 1: BrowseTuitions reads the URL query params with
// useSearchParams(). With cacheComponents enabled, a client
// component that reads search params must sit behind Suspense
// so Next.js can prerender this route safely.
export default function TuitionsPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-slate-50" />}>
      <BrowseTuitions />
    </Suspense>
  );
}
