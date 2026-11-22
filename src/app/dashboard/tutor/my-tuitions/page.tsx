import type { Metadata } from "next";
import MyTuitions from "@/components/dashboard/MyTuitions";

export const metadata: Metadata = {
  title: "My Tuitions | MentorLagbe",
  description:
    "View, edit, close, reopen or delete the tuitions you have posted.",
};

export default function MyTuitionsPage() {
  return <MyTuitions />;
}
