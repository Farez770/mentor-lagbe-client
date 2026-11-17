"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, Menu, X } from "lucide-react";
import AuthBtn from "@/components/layout/authBtn";

// ============================================================
// TODO (for you, later): replace this with the real check.
// If the BetterAuth session exists -> logged in (true),
// otherwise -> false. Change it to `true` for now if you want
// to preview the logged-in navbar design.
// ============================================================
const isLoggedIn = false;

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

  // Closes the menu when a link inside it is clicked
  const closeMenu = () => setMenuOpen(false);

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

        {/* Desktop navigation links */}
        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className="text-slate-600 font-medium hover:text-emerald-600 transition-colors"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right side: logged-in view OR guest buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {isLoggedIn ? (
            // TODO (for you, later): this shows the real session user
            <AuthBtn />
          ) : (
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
                    className="block py-3 px-2 rounded-lg text-slate-700 font-medium hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-4">
              {/* TODO (for you, later): when logged in, show the user's
                  avatar + Dashboard / Update Profile / Sign Out here
                  instead of the two guest buttons */}
              {isLoggedIn ? (
                <AuthBtn />
              ) : (
                <>
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
