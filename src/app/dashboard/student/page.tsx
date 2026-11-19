import type { Metadata } from "next";
import StudentOverview from "@/components/dashboard/StudentOverview";

// Title + description for this page (browser tab / search engines)
export const metadata: Metadata = {
  title: "Student Dashboard | MentorLagbe",
  description:
    "Your overview: applications sent, accepted, pending and your current plan.",
};

// ============================================================
// /dashboard/student — the student's Overview page: the 4
// reusable stats cards from the project requirement
// (Total Applied Tuitions, Accepted Applications, Pending
// Applications, Current Plan: Free/Pro).
// Signed-in students land here after sign-in.
// ============================================================
export default function StudentDashboardPage() {
  return <StudentOverview />;
}
