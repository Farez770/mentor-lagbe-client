import type { Metadata } from "next";
import AdminTuitionApproval from "@/components/dashboard/AdminTuitionApproval";

export const metadata: Metadata = {
  title: "Tuition Approval | MentorLagbe",
  description:
    "Review every tuition post submitted by tutors and approve or reject it.",
};

export default function AdminTuitionsPage() {
  return <AdminTuitionApproval />;
}
