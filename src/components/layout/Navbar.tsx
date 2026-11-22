"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, Menu, X } from "lucide-react";
import AuthBtn from "@/components/layout/authBtn";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { authClient } from "@/lib/auth-client";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Browse Tuitions", href: "/tuitions" },
  { name: "Pricing", href: "/pricing" },
  { name: "How It Works", href: "/#how-it-works" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  const { data: session, isPending } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  if (pathname.startsWith("/dashboard")) return null;

  const closeMenu = () => setMenuOpen(false);

  function isActiveLink(href: string) {
    if (href.includes("#")) {
      return false;
    }
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  function getLinkClass(href: string) {
    return isActiveLink(href)
      ? "text-emerald-600 font-semibold bg-emerald-50"
      : "text-slate-600 font-medium hover:text-emerald-600";
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Mentor<span className="text-emerald-600">Lagbe</span>
          </span>
        </Link>

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

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {isPending ? null : isLoggedIn ? (
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

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle compact />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-700"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

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
