import type { Metadata } from "next";
import AdminTuitionApproval from "@/components/dashboard/AdminTuitionApproval";

// Title + description for this page (browser tab / search engines)
export const metadata: Metadata = {
  title: "Tuition Approval | MentorLagbe",
  description:
    "Review every tuition post submitted by tutors and approve or reject it.",
};

// ============================================================
// /dashboard/admin/tuitions — the Admin Tuition Approval Flow:
// a list of ALL tuition posts (pending / approved / rejected)
// with Approve + Reject buttons that write approvalStatus
// through the protected PATCH /api/admin/tuitions/:id endpoint
// (admin role only).
// ============================================================
export default function AdminTuitionsPage() {
  return <AdminTuitionApproval />;
}
