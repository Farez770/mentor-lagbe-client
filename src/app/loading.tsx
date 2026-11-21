import { PageSkeleton } from "@/components/shared/Loading";

// ============================================================
// ROOT loading.tsx — the instant fallback Next.js shows during
// navigation to any route that has no closer loading.tsx (e.g.
// the home page). The site navbar/footer from layout.tsx stay
// visible; only the page content below them is replaced.
// ============================================================
export default function Loading() {
  return <PageSkeleton />;
}
