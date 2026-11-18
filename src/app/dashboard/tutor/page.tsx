import type { Metadata } from "next";
import TutorOverview from "@/components/dashboard/TutorOverview";

// Title + description for this page (browser tab + search engines)
export const metadata: Metadata = {
  title: "Dashboard (Tutor) | MentorLagbe",
  description:
    "Tutor dashboard overview: total tuitions posted, active tuitions, applicants and current plan.",
};

// The /dashboard/tutor route (Tutor Overview).
// The layout already adds the Navbar and Footer around it,
// so this file only renders the dashboard content.
export default function TutorDashboardPage() {
  return <TutorOverview />;
}
