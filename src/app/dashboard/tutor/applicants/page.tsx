import type { Metadata } from "next";
import ManageApplicants from "@/components/dashboard/ManageApplicants";

export const metadata: Metadata = {
  title: "Manage Applicants | MentorLagbe",
  description:
    "Review the students who applied to your tuitions — accept or reject each application.",
};

export default function ManageApplicantsPage() {
  return <ManageApplicants />;
}
