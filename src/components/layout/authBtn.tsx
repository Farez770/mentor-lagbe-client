"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, LayoutDashboard, LogOut, UserCog } from "lucide-react";
import { Popover, toast } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { clearJwtToken } from "@/lib/api/client";

function RoleBadge({ role }: { role: string }) {
  let badgeColor =
    "bg-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
  if (role === "tutor") {
    badgeColor =
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  }
  if (role === "admin") {
    badgeColor =
      "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300";
  }

  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeColor}`}
    >
      {role}
    </span>
  );
}

export default function AuthBtn({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session } = authClient.useSession();

  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) return null;

  const user = session.user;

  const role: string = user.role ?? "student";

  const dashboardLink =
    role === "admin"
      ? "/dashboard/admin"
      : role === "tutor"
        ? "/dashboard/tutor"
        : "/dashboard/student";

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();

    if (error) {
      toast.warning("Sign out failed. Please try again.");
      return;
    }

    clearJwtToken(); // ★ JWT: do not keep using the old JWT after logout
    setIsOpen(false); // close the popover
    toast.success("Signed out successfully");
    onNavigate?.(); // close the mobile menu (no-op on desktop)
    router.push("/");
    router.refresh(); // refresh server components so everything updates
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  const menuItemClass =
    "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950 dark:hover:text-emerald-300";

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger className="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors border bg-emerald-100  dark:hover:bg-emerald-950">
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

        <span className="max-w-[120px] truncate text-sm font-bold text-slate-900">
          {user.name}
        </span>

        <RoleBadge role={role} />

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Popover.Trigger>

      <Popover.Content
        placement="bottom end"
        className="z-50 w-72 overflow-hidden bg-white dark:bg-slate-900"
      >
        <Popover.Dialog className="p-0 bg-white dark:bg-slate-900 dark:text-slate-100">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-emerald-100 p-4">
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
              <Popover.Heading className="truncate text-sm font-bold text-slate-900">
                {user.name}
              </Popover.Heading>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

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
