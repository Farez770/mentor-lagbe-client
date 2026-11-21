import { DashboardSkeleton } from "@/components/shared/Loading";

// ============================================================
// ONE loading.tsx for EVERY dashboard route:
//   /dashboard/admin, /dashboard/admin/users, …
//   /dashboard/tutor, /dashboard/tutor/applicants, …
//   /dashboard/student, /dashboard/student/bookmarks, …
//
// Next.js nests a child segment's loading.tsx inside its parent,
// so placing it here wraps ALL child pages in one Suspense
// boundary (no need to duplicate it in each role folder).
// ============================================================
export default function Loading() {
  return <DashboardSkeleton />;
}
