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
// ★ REQUIREMENT UPDATE (JWT): clear the in-memory JWT on sign-out.
import { clearJwtToken } from "@/lib/api/client";
import ThemeToggle from "@/components/theme/ThemeToggle";

// ============================================================
// One menu item inside the sidebar, e.g.
//   { name: "Overview", href: "/dashboard/tutor", icon: LayoutDashboard }
// Exported so dashboard pages can build their own list.
// ============================================================
export type DashboardSection = {
  name: string; // label shown in the menu
  href: string; // page the link goes to
  icon: LucideIcon; // lucide icon component (e.g. BookOpen)
};

// The person shown in the sidebar's user card.
// The drawer fills this from the real BetterAuth session
// automatically — the value the page passes in is only a
// fallback shown while the session is still loading.
export type DashboardUser = {
  name: string; // e.g. "Rahat Karim"
  role: string; // e.g. "Tutor" / "Student" / "Admin"
  plan: string; // "Free" or "Pro" (Pro shows a premium badge)
  image?: string; // profile photo (no image → first letter avatar)
};

// ============================================================
// SidebarContent — the INSIDE of the sidebar, shared by:
//   1. the desktop sidebar (always visible on lg and up)
//   2. the mobile / tablet overlay (opens from the menu bar)
// Both show the exact same blocks, in the order of the
// wireframe:
//   [1] Logo + name of the website
//   [2] User card (avatar, name, role, premium badge)
//   [3] All routes / page sections
//   [4] Logout / sign out button at the bottom
//
// THE DRAWER IS THE SAME FOR EVERY ROLE — tutor, student and
// admin all use this; only the title, sections and user that
// the page passes in are different.
// ============================================================
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
  onNavigate?: () => void; // called after a link is clicked (closes the mobile menu)
  onClose?: () => void; // only passed in the mobile overlay → shows the ✕ button
  collapsed?: boolean; // desktop-only icon rail; mobile overlay stays full width
}) {
  const pathname = usePathname(); // current page (for the active highlight)
  const router = useRouter();

  // A link is "active" when it matches the current page exactly
  const isActiveLink = (href: string) => pathname === href;

  // ---- Sign out (same flow as the navbar's Sign Out) --------
  // 1. ends the BetterAuth session (deletes the session cookie)
  // 2. closes the mobile menu
  // 3. shows a toast, then goes back home
  const handleSignOut = async () => {
    const { error } = await authClient.signOut();

    if (error) {
      toast.warning("Sign out failed. Please try again.");
      return;
    }

    clearJwtToken(); // ★ JWT: do not keep using the old JWT after logout
    toast.success("Signed out successfully");
    onNavigate?.(); // close the mobile overlay if it is open
    router.push("/");
    router.refresh(); // refresh server components so the navbar updates
  };

  return (
    <>
      {/* ======================================================
          [1] LOGO + NAME OF THE WEBSITE (emerald header)
          ====================================================== */}
      <div
        className={`flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white ${
          collapsed ? "p-3 lg:justify-center lg:p-4" : "p-5"
        }`}
      >
        <div className={`flex items-center gap-3 ${collapsed ? "lg:gap-0" : ""}`}>
          {/* Same logo mark as the site navbar */}
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

        {/* ✕ close button — only exists in the mobile overlay */}
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

      {/* ======================================================
          [2] USER CARD — avatar + name + role + premium badge
          ====================================================== */}
      <div
        className={`flex items-center gap-3 border-b border-slate-100 ${
          collapsed ? "lg:justify-center lg:p-3" : "p-4"
        }`}
      >
        {/* Profile photo from the session — falls back to the
            first letter of the name when there is no image */}
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- profile photos can come from any domain
          <img
            src={user.image}
            alt={user.name}
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

        <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
          {/* User name */}
          <p className="truncate text-sm font-bold text-slate-800">
            {user.name}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {/* Role badge (Tutor / Student / Admin) */}
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
              {user.role}
            </span>

            {/* Premium badge — ONLY highlighted when the user
                has the Pro plan (per the wireframe). Free users
                simply don't get this badge. */}
            {user.plan === "Pro" && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-300">
                ⭐ Premium
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================
          [3] ALL ROUTES / PAGE SECTIONS
          flex-1 = this area takes all the free space, so the
          logout button stays pinned at the bottom of the sidebar
          ====================================================== */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* <p className="px-1 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          All Routes / Pages
        </p> */}

        <nav className="flex flex-col gap-1">
          {sections.map((section) => {
            // Rename so we can use <Icon /> in JSX
            const Icon = section.icon;
            // Green highlight on the page we are viewing now
            const active = isActiveLink(section.href);

            return (
              <Link
                key={section.name}
                href={section.href}
                // After navigating, close the mobile overlay
                // (a harmless no-op on desktop)
                onClick={onNavigate}
                // In the collapsed desktop rail the label is hidden,
                // so the native tooltip keeps each icon identifiable.
                title={section.name}
                className={`flex cursor-pointer items-center gap-3 rounded-xl py-3 text-sm font-semibold transition-colors ${
                  collapsed ? "lg:justify-center lg:px-0" : "px-4"
                } ${
                  active
                    ? "bg-emerald-50 text-emerald-700" // current page
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

      {/* ======================================================
          [4] THEME + LOGOUT — always at the bottom
          ====================================================== */}
      <div
        className={`border-t border-slate-100 ${
          collapsed ? "lg:p-3" : "p-4"
        }`}
      >
        {/* Dark/light switcher lives here on desktop so every
            dashboard route has it inside the fixed sidebar. */}
        <div
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
        </div>
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
          <span className={collapsed ? "lg:hidden" : ""}>Logout / Sign Out</span>
        </button>
      </div>
    </>
  );
}

// "tutor" -> "Tutor", "free" -> "Free", "pro" -> "Pro"
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
  // Is the mobile / tablet menu open?
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Is the DESKTOP sidebar collapsed into an icon-only rail?
  // The toggle lives in the new top bar so desktop users get the
  // same collapsible behaviour the mobile drawer already had.
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // ============================================================
  // THE REAL LOGGED-IN USER (BetterAuth session).
  // Every useSession() call in the app shares ONE cached
  // request, so this costs nothing extra if the navbar already
  // loaded it. The demo user the page passes in stays visible
  // only for the moment before the session arrives.
  // ============================================================
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

  // ============================================================
  // Lock the BODY scroll while a dashboard page is on screen
  // (project rule: the dashboard shell never scrolls the page).
  //
  // This used to be a CSS rule — body:has(#dashboard-sidebar) {
  // overflow: hidden — but Next.js 16 Cache Components keeps
  // hidden routes mounted in the DOM, so a leftover sidebar
  // would keep the HOME page scroll-locked after navigating
  // away (only the hero visible). An effect works instead:
  // React runs the cleanup whenever this route is hidden or
  // unmounted, which restores normal scrolling, and runs the
  // effect again when the route comes back.
  // ============================================================
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
    // The shell fills the whole screen — the body never scrolls
    <div className="flex h-dvh">
      {/* ======================================================
          DESKTOP SIDEBAR — hidden below lg, always there on
          desktop. Width animates between 288px and 80px when
          the top-bar toggle is clicked.
          ====================================================== */}
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
          // Desktop has no overlay to close — this is a no-op
          onNavigate={() => setIsMenuOpen(false)}
        />
      </aside>

      {/* ======================================================
          RIGHT SIDE = TOP BAR + scrollable page content
          ====================================================== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* ---- TOP BAR — visible on every screen size ----
            Mobile/tablet: ☰ opens the overlay drawer.
            Desktop: the panel icon collapses/expands the fixed
            sidebar into an icon-only rail. */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 md:px-5">
          <div className="flex min-w-0 items-center gap-2">
            {/* ☰ open-menu button — mobile/tablet only */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              className="cursor-pointer rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Collapse/expand button — desktop only */}
            <button
              type="button"
              onClick={() =>
                setIsDesktopCollapsed((collapsed) => !collapsed)
              }
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

            {/* Small logo + page title */}
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

          {/* Theme switcher + avatar/name so the user is always visible */}
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            {shownUser.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- profile photos can come from any domain
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

        {/* ---- PAGE CONTENT — the only scrollable area ----
            It changes with the route (overview, post-tuition,
            my-tuitions, applicants, ...). */}
        <div className="flex-1 overflow-y-auto bg-slate-50">{children}</div>
      </div>

      {/* ======================================================
          MOBILE / TABLET OVERLAY MENU (rendered only below lg)
          ====================================================== */}
      {/* Dark backdrop — tap it to close the menu */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
        />
      )}

      {/* The menu panel — slides in from the LEFT.
          It always stays in the DOM (translated off-screen when
          closed) so the slide animation works. */}
      <aside
        aria-hidden={!isMenuOpen}
        className={`fixed inset-y-0 left-0 z-[60] flex w-80 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Exactly the same content as the desktop sidebar */}
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
