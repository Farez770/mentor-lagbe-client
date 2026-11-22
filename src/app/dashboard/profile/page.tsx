import type { Metadata } from "next";
import UpdateProfile from "@/components/dashboard/UpdateProfile";

export const metadata: Metadata = {
  title: "Update Profile | MentorLagbe",
  description:
    "Update your name, phone, bio and profile picture (ImgBB upload or image URL).",
};

export default function ProfilePage() {
  return <UpdateProfile />;
}
