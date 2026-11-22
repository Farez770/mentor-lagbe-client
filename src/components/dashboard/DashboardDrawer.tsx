"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { clearJwtToken } from "@/lib/api/client";
import ThemeToggle from "@/components/theme/ThemeToggle";
import Image from "next/image";

export type DashboardSection = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export type DashboardUser = {
  name: string;
  role: string;
  plan: string;
  image?: string;
};

function SidebarContent({
  title,
  sections,
  user,
  onNavigate,
  onClose,
  collapsed = false,
}: {
  title: string;
  sections: DashboardSection[];
  user: DashboardUser;
  onNavigate?: () => void;
  onClose?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActiveLink = (href: string) => pathname === href;

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();

    if (error) {
      toast.warning("Sign out failed. Please try again.");
      return;
    }

    clearJwtToken();
    toast.success("Signed out successfully");
    onNavigate?.();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <div
        className={`flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white ${
          collapsed ? "p-3 lg:justify-center lg:p-4" : "p-5"
        }`}
      >
        <div
          className={`flex items-center gap-3 ${collapsed ? "lg:gap-0" : ""}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <GraduationCap className="h-6 w-6" />
          </span>
          <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
            <p className="text-base font-extrabold leading-tight">
              MentorLagbe
            </p>
            <p className="truncate text-xs text-emerald-50">{title}</p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-white/15"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div
        className={`flex items-center gap-3 border-b border-slate-100 bg-emerald-50 ${
          collapsed ? "lg:justify-center lg:p-3" : "p-4"
        }`}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            width={48}
            height={48}
            className={`h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-emerald-100 ${
              collapsed ? "lg:h-10 lg:w-10" : ""
            }`}
          />
        ) : (
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-extrabold text-emerald-700 ${
              collapsed ? "lg:h-10 lg:w-10 lg:text-base" : ""
            }`}
          >
            {user.name.charAt(0)}
          </span>
        )}

        <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""} `}>
          <p className="truncate text-sm font-bold text-slate-800">
            {user.name}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
              {user.role}
            </span>

            {user.plan === "Pro" && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-300">
                ⭐ Premium
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <nav className="flex flex-col gap-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const active = isActiveLink(section.href);

            return (
              <Link
                key={section.name}
                href={section.href}
                onClick={onNavigate}
                title={section.name}
                className={`flex cursor-pointer items-center gap-3 rounded-xl py-3 text-sm font-semibold transition-colors ${
                  collapsed ? "lg:justify-center lg:px-0" : "px-4"
                } ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={collapsed ? "lg:hidden" : ""}>
                  {section.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className={`border-t border-slate-100 ${collapsed ? "lg:p-3" : "p-4"}`}
      >
        {/* <div
          className={`mb-3 flex items-center justify-between rounded-xl bg-slate-50 py-2 ${
            collapsed ? "lg:justify-center lg:px-0" : "px-3"
          }`}
        >
          <span
            className={`text-xs font-bold text-slate-600 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Appearance
          </span>
          <ThemeToggle compact />
        </div> */}
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100 ${
            collapsed ? "lg:px-0" : "px-4"
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={collapsed ? "lg:hidden" : ""}>
            Logout / Sign Out
          </span>
        </button>
      </div>
    </>
  );
}

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

export default function DashboardDrawer({
  title,
  sections,
  user,
  children,
}: {
  title: string; // e.g. "Tutor Dashboard"
  sections: DashboardSection[]; // the routes to show
  user: DashboardUser; // fallback shown while the session loads
  children: ReactNode; // the page content (changes per route)
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const { data: session } = authClient.useSession();
  const sessionUser = session?.user;

  const shownUser: DashboardUser = sessionUser
    ? {
        name: sessionUser.name,
        role: capitalize(String(sessionUser.role ?? "student")),
        plan: capitalize(String(sessionUser.plan ?? "free")),
        image: sessionUser.image || undefined,
      }
    : user;

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  return (
    <div className="flex h-dvh">
      <aside
        id="dashboard-sidebar"
        className={`hidden shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out lg:flex ${
          isDesktopCollapsed ? "lg:w-20" : "lg:w-72"
        }`}
      >
        <SidebarContent
          title={title}
          sections={sections}
          user={shownUser}
          collapsed={isDesktopCollapsed}
          onNavigate={() => setIsMenuOpen(false)}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 md:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              className="cursor-pointer rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsDesktopCollapsed((collapsed) => !collapsed)}
              aria-label={
                isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              aria-expanded={!isDesktopCollapsed}
              className="hidden cursor-pointer rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 lg:inline-flex"
            >
              {isDesktopCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-800">
                {title}
              </p>
              <p className="hidden truncate text-xs text-slate-500 md:block">
                Signed in as {shownUser.name} · {shownUser.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            {shownUser.image ? (
              <img
                src={shownUser.image}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-700">
                {shownUser.name.charAt(0)}
              </span>
            )}
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-xs font-bold text-slate-800">
                {shownUser.name}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {shownUser.role} · {shownUser.plan}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">{children}</div>
      </div>

      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
        />
      )}

      <aside
        aria-hidden={!isMenuOpen}
        className={`fixed inset-y-0 left-0 z-[60] flex w-80 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          title={title}
          sections={sections}
          user={shownUser}
          onNavigate={() => setIsMenuOpen(false)} // close after a link click
          onClose={() => setIsMenuOpen(false)} // ✕ button
        />
      </aside>
    </div>
  );
}
