import type { Metadata } from "next";
import BrowseTuitions from "@/components/tuitions/BrowseTuitions";

// Title + description for this page (shown in the browser tab
// and used by search engines)
export const metadata: Metadata = {
  title: "Browse Tuitions | MentorLagbe",
  description:
    "Search and filter all admin-approved and active tuition listings by subject, class level and mode.",
};

// The /tuitions page.
// The layout already adds the Navbar and Footer around it,
// so this file only renders the browse content.
export default function TuitionsPage() {
  return <BrowseTuitions />;
}
