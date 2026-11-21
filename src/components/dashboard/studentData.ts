import { Bookmark, Home, LayoutDashboard, Send, UserCog } from "lucide-react";

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
//   1. /dashboard/student (Overview)              ✅
//   2. /dashboard/student/my-applications          ✅
//   3. /dashboard/student/bookmarks                ✅ NEW (2026-11-21)
//   4. /dashboard/profile (Update Profile)         ✅
// TODO (later): pricing page
// ============================================================
export const studentSections = [
  { name: "Overview", href: "/dashboard/student", icon: LayoutDashboard }, // works now ✅
  { name: "My Applications", href: "/dashboard/student/my-applications", icon: Send }, // works now ✅
  // NEW requirement (2026-11-21): Free = 5 bookmarks, Pro = unlimited
  { name: "My Bookmarks", href: "/dashboard/student/bookmarks", icon: Bookmark }, // works now ✅
  { name: "Update Profile", href: "/dashboard/profile", icon: UserCog }, // works now ✅
  { name: "Back to Home", href: "/", icon: Home }, // works now ✅
];
