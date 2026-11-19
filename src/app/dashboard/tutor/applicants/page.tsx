import type { Metadata } from "next";
import ManageApplicants from "@/components/dashboard/ManageApplicants";

// Title + description for this page (browser tab / search engines)
export const metadata: Metadata = {
  title: "Manage Applicants | MentorLagbe",
  description:
    "Review the students who applied to your tuitions — accept or reject each application.",
};

// ============================================================
// /dashboard/tutor/applicants — "Manage Applicants": every
// student who applied to this tutor's tuition posts (name,
// email, phone, preferred schedule, note, tuition title),
// with a status the tutor can set to accepted or rejected.
// ============================================================
export default function ManageApplicantsPage() {
  return <ManageApplicants />;
}
