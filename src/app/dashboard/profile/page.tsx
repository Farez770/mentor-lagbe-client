import type { Metadata } from "next";
import UpdateProfile from "@/components/dashboard/UpdateProfile";

// Title + description for this page (browser tab / search engines)
export const metadata: Metadata = {
  title: "Update Profile | MentorLagbe",
  description:
    "Update your name, phone, bio and profile picture (ImgBB upload or image URL).",
};

// ============================================================
// /dashboard/profile — the ONE dashboard page that belongs
// to every role (Student, Tutor, Admin): the navbar dropdown
// and the tutor sidebar both link here, and the backend has
// no role check on PATCH /api/profile.
// ============================================================
export default function ProfilePage() {
  return <UpdateProfile />;
}
