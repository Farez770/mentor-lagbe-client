import {
  ClipboardCheck,
  CreditCard,
  Home,
  LayoutDashboard,
  UserCog,
  Users,
} from "lucide-react";


export const demoAdmin = {
  name: "Admin One",
  plan: "Free",
};

export const adminSections = [
  { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/dashboard/admin/users", icon: Users },
  { name: "Tuition Approval", href: "/dashboard/admin/tuitions", icon: ClipboardCheck },
  { name: "Transactions", href: "/dashboard/admin/transactions", icon: CreditCard },
  { name: "Update Profile", href: "/dashboard/profile", icon: UserCog },
  { name: "Back to Home", href: "/", icon: Home },
];
