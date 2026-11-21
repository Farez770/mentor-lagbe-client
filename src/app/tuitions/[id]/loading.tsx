import { TuitionDetailsSkeleton } from "@/components/shared/Loading";

// ============================================================
// /tuitions/[id] (View Details) — the main DATA-FETCHING route
// (partial prerender). While the tuition row is fetched from the
// API, this skeleton streams in place of the real page, so the
// user sees the page shape immediately instead of a blank screen.
// ============================================================
export default function Loading() {
  return <TuitionDetailsSkeleton />;
}
