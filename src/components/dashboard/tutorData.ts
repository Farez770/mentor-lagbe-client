import {
  BookOpen,
  LayoutDashboard,
  UserCog,
  Home,
  FilePlus,
  Users,
  Sparkles,
} from "lucide-react";


export const demoTutor = {
  name: "Rahat Karim",
  plan: "Free",
};

export const tutorSections = [
  { name: "Overview", href: "/dashboard/tutor", icon: LayoutDashboard },
  {
    name: "Post a Tuition",
    href: "/dashboard/tutor/post-tuition",
    icon: FilePlus,
  },
  { name: "My Tuitions", href: "/dashboard/tutor/my-tuitions", icon: BookOpen },
  {
    name: "Manage Applicants",
    href: "/dashboard/tutor/applicants",
    icon: Users,
  },
  { name: "Update Profile", href: "/dashboard/profile", icon: UserCog },
  { name: "Upgrade to Pro", href: "/pricing", icon: Sparkles },
  { name: "Back to Home", href: "/", icon: Home },
];
