import type { Metadata } from "next";
import StudentOverview from "@/components/dashboard/StudentOverview";

export const metadata: Metadata = {
  title: "Student Dashboard | MentorLagbe",
  description:
    "Your overview: applications sent, accepted, pending and your current plan.",
};

export default function StudentDashboardPage() {
  return <StudentOverview />;
}
