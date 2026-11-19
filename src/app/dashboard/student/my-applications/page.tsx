import type { Metadata } from "next";
import MyApplications from "@/components/dashboard/MyApplications";

// Title + description for this page (browser tab / search engines)
export const metadata: Metadata = {
  title: "My Applications | MentorLagbe",
  description:
    "Every tuition you applied for — tutor decision, monthly fee and cancel options.",
};

// ============================================================
// /dashboard/student/my-applications — the student's
// "My Applications" list: every tuition they applied to, with
// the tutor's decision (Pending / Accepted / Rejected) and a
// Cancel button for anything still pending.
// ============================================================
export default function MyApplicationsPage() {
  return <MyApplications />;
}
