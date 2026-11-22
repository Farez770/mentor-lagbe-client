import type { Metadata } from "next";
import TuitionDetails from "@/components/tuitions/TuitionDetails";

export const metadata: Metadata = {
  title: "Tuition Details | MentorLagbe",
  description: "Full details of a tuition listing on MentorLagbe.",
};

export const instant = false;

export default async function TuitionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TuitionDetails id={id} />;
}
