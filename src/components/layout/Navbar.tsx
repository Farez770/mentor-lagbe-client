"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, Menu, X } from "lucide-react";
import AuthBtn from "@/components/layout/authBtn";
import { authClient } from "@/lib/auth-client";

// Links shown to everyone in the navbar
const navLinks = [
  { name: "Home", href: "/" },
  { name: "Browse Tuitions", href: "/tuitions" },
  { name: "Pricing", href: "/pricing" },
  { name: "How It Works", href: "/#how-it-works" },
];

export default function Navbar() {
  // Used only to open/close the mobile menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Current route path, used to highlight the active link
  const pathname = usePathname();

  // ---- Login check ---------------------------------------------
  // Read the real BetterAuth session:
  //   - session exists  -> user is logged in  -> show AuthBtn
  //   - no session      -> user is a guest    -> show Sign In / Sign Up
  // While isPending (session still loading) we show NEITHER, so the
  // guest buttons never flash for a user who is actually logged in.
  const { data: session, isPending } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  // ---- Dashboard pages have NO site navbar (project rule) ----
  // Keyed to the ACTIVE route: Next.js 16 Cache Components keeps
  // hidden routes in the DOM (instant back navigation), so a CSS
  // :has(#dashboard-sidebar) check would keep matching leftover
  // dashboard DOM after navigating away — hiding the navbar on
  // the home page too. usePathname() only ever reflects the
  // route that is actually on screen, and it is known during
  // SSR as well, so there is no flash on a hard load either.
  if (pathname.startsWith("/dashboard")) return null;

  // Closes the menu when a link inside it is clicked
  const closeMenu = () => setMenuOpen(false);

  // Returns true when a nav link matches the current page
  function isActiveLink(href: string) {
    // Hash links like "/#how-it-works" are never marked active
    if (href.includes("#")) {
      return false;
    }
    // Home is active only on the exact home page
    if (href === "/") {
      return pathname === "/";
    }
    // Other links are active on their own page and sub-pages
    return pathname === href || pathname.startsWith(href + "/");
  }

  // Shared link styling so desktop and mobile look the same
  function getLinkClass(href: string) {
    return isActiveLink(href)
      ? "text-emerald-600 font-semibold bg-emerald-50"
      : "text-slate-600 font-medium hover:text-emerald-600";
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        {/* Logo + brand name */}
        <Link href="/" className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Mentor<span className="text-emerald-600">Lagbe</span>
          </span>
        </Link>

        {/* Desktop navigation links (active link is highlighted green) */}
        <ul className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-colors ${getLinkClass(link.href)}`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right side: logged-in view OR guest buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {isPending ? null : isLoggedIn ? (
            // Logged in -> avatar, name, role badge, Dashboard,
            // Update Profile and Sign Out (all real, from the session)
            <AuthBtn />
          ) : (
            // Guest -> Sign In / Sign Up buttons
            <>
              <Link
                href="/sign-in"
                className="px-5 py-2.5 rounded-lg font-semibold text-slate-700 border border-slate-300 hover:border-emerald-600 hover:text-emerald-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2.5 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 text-slate-700"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu — slides down slowly over the page content.
          It is absolutely positioned below the navbar and given a high
          z-index, so it always sits ON TOP of sections like the hero. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="lg:hidden absolute top-full left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-xl px-4 py-4"
          >
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className={`block py-3 px-3 rounded-lg transition-colors ${getLinkClass(link.href)}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Same login check as the desktop side. The account menu
                is a HeroUI Popover now, so no special mobile layout is
                needed — onNavigate closes this menu when the user
                picks Dashboard / Update Profile inside the popover */}
            <div className="mt-4">
              {isPending ? null : isLoggedIn ? (
                <AuthBtn onNavigate={closeMenu} />
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/sign-in"
                    onClick={closeMenu}
                    className="flex-1 text-center px-5 py-2.5 rounded-lg font-semibold text-slate-700 border border-slate-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={closeMenu}
                    className="flex-1 text-center px-5 py-2.5 rounded-lg font-semibold text-white bg-emerald-600"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
