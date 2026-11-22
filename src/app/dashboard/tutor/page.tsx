import type { Metadata } from "next";
import TutorOverview from "@/components/dashboard/TutorOverview";

export const metadata: Metadata = {
  title: "Dashboard (Tutor) | MentorLagbe",
  description:
    "Tutor dashboard overview: total tuitions posted, active tuitions, applicants and current plan.",
};

export default function TutorDashboardPage() {
  return <TutorOverview />;
}
