import { ClipboardCheck, Home, LayoutDashboard, UserCog, Users } from "lucide-react";

// ============================================================
// Shared data for EVERY admin dashboard page.
// (Same idea as tutorData.ts / studentData.ts — one file so
// all admin pages show the exact same sidebar.)
// ============================================================

// Fallback user shown in the sidebar's user card while the
// BetterAuth session is still loading. DashboardDrawer swaps
// in the REAL logged-in admin (name, role, plan, photo) as
// soon as useSession() answers.
export const demoAdmin = {
  name: "Admin One", // fallback for the "Welcome back" heading
  plan: "Free", // shown in the sidebar user card
};

// ============================================================
// All sections in the admin's LEFT SIDEBAR.
//   1. /dashboard/admin (Overview)             ✅
//   2. /dashboard/admin/users (User Mgmt)      ✅
//   3. /dashboard/admin/tuitions (Approval)    ✅ this step
//   4. /dashboard/profile (Update Profile)     ✅
// ============================================================
export const adminSections = [
  { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard }, // works now ✅
  { name: "User Management", href: "/dashboard/admin/users", icon: Users }, // works now ✅
  { name: "Tuition Approval", href: "/dashboard/admin/tuitions", icon: ClipboardCheck }, // works now ✅
  { name: "Update Profile", href: "/dashboard/profile", icon: UserCog }, // works now ✅
  { name: "Back to Home", href: "/", icon: Home }, // works now ✅
];
