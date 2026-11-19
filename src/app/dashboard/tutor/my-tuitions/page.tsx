import type { Metadata } from "next";
import MyTuitions from "@/components/dashboard/MyTuitions";

// Title + description for this page (browser tab / search engines)
export const metadata: Metadata = {
  title: "My Tuitions | MentorLagbe",
  description:
    "View, edit, close, reopen or delete the tuitions you have posted.",
};

// ============================================================
// /dashboard/tutor/my-tuitions — "My Created Tuitions (Full
// CRUD)": the logged-in tutor sees every tuition they posted
// with its admin approvalStatus and active status, and can
// edit / toggle / delete each one.
// ============================================================
export default function MyTuitionsPage() {
  return <MyTuitions />;
}
