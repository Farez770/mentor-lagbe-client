"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Browse Tuitions", href: "/tuitions" },
  { name: "Pricing", href: "/pricing" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Sign Up", href: "/sign-up" },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) return null;

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Mentor<span className="text-emerald-400">Lagbe</span>
            </span>
          </Link>
          <p className="text-sm leading-6 text-slate-400">
            The smart tuition and mentorship platform. Find verified tutors,
            join subject-wise batches, and book 1-on-1 mentorship sessions.
          </p>

          <div className="flex gap-3 mt-5">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M13.5 21v-7h2.5l.5-3h-3V9.5c0-.9.3-1.5 1.6-1.5H16.6V5.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9V11H8v3h2.5v7h3z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors"
              aria-label="YouTube"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8zM10 15.2V8.8L15.5 12 10 15.2z" />
              </svg>
            </a>
            <a
              href="https://x.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors"
              aria-label="X (Twitter)"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M18.9 2.1h3.4l-7.4 8.5L23.6 22h-6.8l-5.3-7-6.1 7H2l7.9-9.1L1.6 2.1h7l4.8 6.4 5.5-6.4zm-1.2 17.8h1.9L7 4H5l12.7 15.9z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M6.9 8.5H3.6V21h3.3V8.5zM5.2 7.1a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8zM21 14.2c0-3.2-1.7-4.7-4-4.7-1.9 0-2.7 1-3.2 1.8V8.5H10.5V21h3.3v-6.9c0-1.5.3-2.9 2.1-2.9s1.8 1.7 1.8 3V21H21v-6.8z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-4">Contact Info</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <Mail className="w-4 h-4 mt-1 text-emerald-400 shrink-0" />
              <span>support@mentorlagbe.com</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-4 h-4 mt-1 text-emerald-400 shrink-0" />
              <span>+880 1700-000000</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-1 text-emerald-400 shrink-0" />
              <span>Bakalia, Chattogram, Bangladesh</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-4">Support Hours</h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>Saturday - Thursday: 9:00 AM - 9:00 PM</li>
            <li>Friday: 3:00 PM - 9:00 PM</li>
            <li className="pt-3 border-t border-slate-800">
              We reply to every message within 24 hours.
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <p className="max-w-7xl mx-auto px-4 py-5 text-center text-sm text-slate-500">
          &copy; 2026 MentorLagbe. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
