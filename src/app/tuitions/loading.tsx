import { PageSkeleton } from "@/components/shared/Loading";

// ============================================================
// /tuitions (Browse) — navigation fallback. Looks like the real
// page: heading, search/filter bar and a grid of tuition cards.
// ============================================================
export default function Loading() {
  return <PageSkeleton />;
}
