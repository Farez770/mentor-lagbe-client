import {
  BookOpen,
  LayoutDashboard,
  UserCog,
  Home,
  FilePlus,
  Users,
  Sparkles,
} from "lucide-react";

// ============================================================
// Shared data for EVERY tutor dashboard page
// (Overview, Post a Tuition, My Tuitions, ...).
//
// It lives in its own file so all those pages show the exact
// same sidebar without copy-pasting.
// ============================================================

// Fallback user shown in the sidebar's user card while the
// BetterAuth session is still loading. DashboardDrawer replaces
// it with the REAL logged-in user (name, role, plan, photo) as
// soon as useSession() answers. Also used for the demo stats.
export const demoTutor = {
  name: "Rahat Karim", // fallback for the "Welcome back" heading
  plan: "Free", // "Free" or "Pro" (requirement: Current Plan card)
};

// ============================================================
// All sections shown inside the tutor's LEFT SIDEBAR.
// The first three routes are required by the project spec:
//   1. /dashboard/tutor/post-tuition  (Post a Tuition Page) ✅
//   2. /dashboard/tutor/my-tuitions   (My Created Tuitions — TODO)
//   3. /dashboard/tutor/applicants    (Manage Applicants — TODO)
// ============================================================
export const tutorSections = [
  { name: "Overview", href: "/dashboard/tutor", icon: LayoutDashboard }, // works now ✅
  {
    name: "Post a Tuition",
    href: "/dashboard/tutor/post-tuition",
    icon: FilePlus,
  }, // works now ✅ (form + real API)
  { name: "My Tuitions", href: "/dashboard/tutor/my-tuitions", icon: BookOpen }, // TODO later: create this page (full CRUD)
  {
    name: "Manage Applicants",
    href: "/dashboard/tutor/applicants",
    icon: Users,
  }, // TODO later: create this page (approve/reject)
  { name: "Update Profile", href: "/dashboard/profile", icon: UserCog }, // TODO later: create this page
  { name: "Upgrade to Pro", href: "/pricing", icon: Sparkles }, // TODO later: create the pricing page
  { name: "Back to Home", href: "/", icon: Home }, // works now ✅
];
