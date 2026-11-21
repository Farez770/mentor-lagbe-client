"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, LayoutDashboard, LogOut, UserCog } from "lucide-react";
import { Popover, toast } from "@heroui/react";
import { authClient } from "@/lib/auth-client";

// ============================================================
// Small helper that picks the badge color for each role
// (student = green, tutor = amber, admin = rose)
// ============================================================
function RoleBadge({ role }: { role: string }) {
  let badgeColor =
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"; // default = student
  if (role === "tutor") {
    badgeColor = "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  }
  if (role === "admin") {
    badgeColor = "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300";
  }

  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeColor}`}
    >
      {role}
    </span>
  );
}

// ============================================================
// Props:
//   onNavigate -> called when a popover link is clicked or the
//                 user signs out (the mobile menu passes its
//                 closeMenu here so the menu closes too)
// ============================================================
export default function AuthBtn({ onNavigate }: { onNavigate?: () => void }) {
  // The REAL logged-in user, read from the BetterAuth session.
  // Every component that calls useSession shares one cached request,
  // so the Navbar and this component never fetch twice.
  const { data: session } = authClient.useSession();

  // useRouter lets us move to another page after signing out
  const router = useRouter();

  // Whether the popover dropdown is open.
  // We keep it as state (controlled) so we can close it from code —
  // e.g. when a menu link is clicked or the user signs out.
  const [isOpen, setIsOpen] = useState(false);

  // Safety net: if there is no session, show nothing at all
  // (the Navbar also hides us while the session is loading, so the
  // guest Sign In / Sign Up buttons never flash for a logged-in user)
  if (!session?.user) return null;

  const user = session.user;

  // The role stored in the "users" collection when they signed up.
  // Typed as plain "string" because admins are added manually in the
  // database (BetterAuth's type only knows student | tutor).
  const role: string = user.role ?? "student";

  // Each role gets its own dashboard page
  const dashboardLink =
    role === "admin"
      ? "/dashboard/admin"
      : role === "tutor"
        ? "/dashboard/tutor"
        : "/dashboard/student";

  // ---- Sign Out -------------------------------------------------
  // 1. ends the BetterAuth session (deletes the session cookie)
  // 2. closes the popover + mobile menu
  // 3. shows a toast, then goes back home
  // After this, useSession() returns null -> the Navbar
  // automatically switches back to the guest buttons.
  const handleSignOut = async () => {
    const { error } = await authClient.signOut();

    if (error) {
      toast.warning("Sign out failed. Please try again.");
      return;
    }

    setIsOpen(false); // close the popover
    toast.success("Signed out successfully");
    onNavigate?.(); // close the mobile menu (no-op on desktop)
    router.push("/");
    router.refresh(); // refresh server components so everything updates
  };

  // Runs when Dashboard / Update Profile is clicked:
  // close the popover (and the mobile menu), then the Link
  // does the actual page navigation.
  const handleLinkClick = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  // Shared style for the menu items inside the popover
  const menuItemClass =
    "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950 dark:hover:text-emerald-300";

  return (
    // Popover = the whole dropdown: a trigger button + a popup.
    // isOpen / onOpenChange = controlled open state (see useState above).
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      {/* ========================================================
          TRIGGER — what the user sees in the navbar:
          avatar + name + role badge + arrow
          ======================================================== */}
      <Popover.Trigger className="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950">
        {/* Profile image, or the first letter if there is no photo */}
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "User avatar"}
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full border-2 border-emerald-500 object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-100 font-bold text-emerald-700">
            {user.name?.charAt(0).toUpperCase() ?? "U"}
          </span>
        )}

        {/* User name (truncated so it never overflows) */}
        <span className="max-w-[120px] truncate text-sm font-bold text-slate-900">
          {user.name}
        </span>

        {/* Role badge: STUDENT / TUTOR / ADMIN */}
        <RoleBadge role={role} />

        {/* Arrow that flips up while the popover is open */}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Popover.Trigger>

      {/* ========================================================
          POPUP — the dropdown menu itself.
          placement="bottom end" -> opens below the trigger,
            right-aligned (stays inside the screen)
          z-50 -> always on top of the navbar and page content
          overflow-hidden -> clips the header background into the
            rounded corners (we skip Popover.Arrow on purpose —
            a menu looks cleaner without it)
          ======================================================== */}
      <Popover.Content
        placement="bottom end"
        className="z-50 w-72 overflow-hidden bg-white dark:bg-slate-900"
      >
        {/* p-0 removes the dialog's default padding — we control
            the spacing ourselves so sections can touch the edges */}
        <Popover.Dialog className="p-0 bg-white dark:bg-slate-900 dark:text-slate-100">
          {/* --- Header: which account is logged in --- */}
          <div className="flex items-center gap-3 border-b border-slate-200 bg-emerald-50 p-4">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "User avatar"}
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-full border-2 border-emerald-500 object-cover"
              />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-100 font-bold text-emerald-700">
                {user.name?.charAt(0).toUpperCase() ?? "U"}
              </span>
            )}
            <div className="min-w-0">
              {/* Heading = the dialog's accessible title (HeroUI pairs
                  it with the dialog automatically) */}
              <Popover.Heading className="truncate text-sm font-bold text-slate-900">
                {user.name}
              </Popover.Heading>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          {/* --- Menu links --- */}
          <div className="p-2">
            <Link
              href={dashboardLink}
              onClick={handleLinkClick}
              className={menuItemClass}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={handleLinkClick}
              className={menuItemClass}
            >
              <UserCog className="h-4 w-4" />
              Update Profile
            </Link>
          </div>

          {/* --- Sign Out (kept separate with a top border) --- */}
          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
