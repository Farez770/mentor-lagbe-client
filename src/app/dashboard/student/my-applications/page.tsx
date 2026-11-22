import type { Metadata } from "next";
import MyApplications from "@/components/dashboard/MyApplications";

export const metadata: Metadata = {
  title: "My Applications | MentorLagbe",
  description:
    "Every tuition you applied for — tutor decision, monthly fee and cancel options.",
};

export default function MyApplicationsPage() {
  return <MyApplications />;
}
