"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

// ============================================================
// TODO (for you, later): remove this fake user.
// Get the real logged-in user from the BetterAuth session
// (useSession hook from auth-client) and use that data here:
// name, role, image.
// ============================================================
const demoUser = {
  name: "Rahat Karim",
  role: "tutor", // can be 'student' | 'tutor' | 'admin'
  image: "https://randomuser.me/api/portraits/men/32.jpg",
};

// TODO (for you, later): the Dashboard link should point to the
// logged-in user's own dashboard, for example:
//   student -> /dashboard/student
//   tutor   -> /dashboard/tutor
//   admin   -> /dashboard/admin
const dashboardLink = "/dashboard";

// Small helper that picks the badge color for each role
// (design only — no logic to change here later)
function RoleBadge({ role }: { role: string }) {
  let badgeColor = "bg-emerald-100 text-emerald-700"; // default = student
  if (role === "tutor") {
    badgeColor = "bg-amber-100 text-amber-700";
  }
  if (role === "admin") {
    badgeColor = "bg-rose-100 text-rose-700";
  }

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${badgeColor}`}
    >
      {role}
    </span>
  );
}

export default function AuthBtn() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Profile image (avatar) + name + role badge */}
      <div className="flex items-center gap-2">
        {/* TODO (for you, later): if the user has no image,
            show their first letter in a colored circle instead */}
        <img
          src={demoUser.image}
          alt={demoUser.name}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-500 object-cover"
        />
        <div className="hidden md:block leading-tight">
          <p className="text-sm font-bold text-slate-900">{demoUser.name}</p>
          <RoleBadge role={demoUser.role} />
        </div>
      </div>

      {/* Dashboard link */}
      <Link
        href={dashboardLink}
        className="hidden md:inline-block px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 border border-slate-300 hover:border-emerald-600 hover:text-emerald-600 transition-colors"
      >
        Dashboard
      </Link>

      {/* Update Profile link */}
      <Link
        href="/dashboard/profile"
        className="hidden md:inline-block px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 border border-slate-300 hover:border-emerald-600 hover:text-emerald-600 transition-colors"
      >
        Update Profile
      </Link>

      {/* Sign Out button */}
      {/* ============================================================
          TODO (for you, later): connect this button to real logout:
          1. call BetterAuth signOut() from auth-client
          2. show a success toast (sonner)
          3. redirect the user to the home page
          ============================================================ */}
      <button
        type="button"
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
