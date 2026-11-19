import { Home, LayoutDashboard, UserCog } from "lucide-react";

// ============================================================
// Shared data for EVERY student dashboard page.
// (Same idea as tutorData.ts — one file so all student pages
// show the exact same sidebar without copy-pasting.)
// ============================================================

// Fallback user shown in the sidebar's user card while the
// BetterAuth session is still loading. DashboardDrawer swaps
// in the REAL logged-in student (name, role, plan, photo)
// as soon as useSession() answers.
export const demoStudent = {
  name: "Student One", // fallback for the "Welcome back" heading
  plan: "Free", // "Free" or "Pro" (requirement: Current Plan card)
};

// ============================================================
// All sections in the student's LEFT SIDEBAR.
//   1. /dashboard/student (Overview)     ✅ this step
//   2. /dashboard/profile (Update Profile) ✅
// TODO (later): "Applied Tuitions" list page + pricing page
// ============================================================
export const studentSections = [
  { name: "Overview", href: "/dashboard/student", icon: LayoutDashboard }, // works now ✅
  { name: "Update Profile", href: "/dashboard/profile", icon: UserCog }, // works now ✅
  { name: "Back to Home", href: "/", icon: Home }, // works now ✅
];
