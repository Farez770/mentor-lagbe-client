import { Bookmark, Home, LayoutDashboard, Send, UserCog } from "lucide-react";


export const demoStudent = {
  name: "Student One",
  plan: "Free",
};

export const studentSections = [
  { name: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
  { name: "My Applications", href: "/dashboard/student/my-applications", icon: Send },
  { name: "My Bookmarks", href: "/dashboard/student/bookmarks", icon: Bookmark },
  { name: "Update Profile", href: "/dashboard/profile", icon: UserCog },
  { name: "Back to Home", href: "/", icon: Home },
];
