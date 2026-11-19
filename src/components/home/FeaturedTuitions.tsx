"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, CalendarDays, ArrowRight, Loader2 } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";
import type { Tuition } from "@/components/tuitions/TuitionCard";
import { getTuitions } from "@/lib/api/tuitions";

// ============================================================
// DYNAMIC FEATURED TUITIONS (/ home page)
//
// Requirement: show the 6 LATEST Approved & Active listings
// from MongoDB, each card equal height + width, showing:
//   Title, Subject, Class Level, Mode, Monthly Fee,
//   Tutor Name and a "View Details" button.
//
// Data comes from GET /api/tuitions (newest first), so
// slice(0, 6) keeps exactly the 6 latest.
//
// TODO (Phase 5 — admin approval): once the admin can approve
// listings, the API will return ONLY approved ones — until
// then every ACTIVE post shows (same rule as the Browse page),
// so a tutor can immediately see their own new tuition here.
// ============================================================

export default function FeaturedTuitions() {
  // The6 latest tuitions (starts empty until the API answers)
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    getTuitions()
      .then((data) => {
        if (!alive) return;
        // The API shape (tutorName, approvalStatus) is mapped
        // to the card's shape (tutor, status), then we keep
        // only the 6 newest listings
        setTuitions(
          data.tuitions
            .slice(0, 6) // requirement: 6 latest listings
            .map((item) => ({
              id: item.id,
              title: item.title,
              subject: item.subject,
              classLevel: item.classLevel,
              mode: item.mode,
              fee: item.fee,
              days: item.days,
              location: item.location,
              tutor: item.tutorName,
              image: item.image,
              status: item.approvalStatus,
              isActive: item.isActive,
            })),
        );
      })
      .catch((err) => {
        // e.g. API server not running → show the empty state
        console.warn("Could not load featured tuitions:", err);
        if (alive) setTuitions([]);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    // cleanup: never set state after unmount
    return () => {
      alive = false;
    };
  }, []); // [] = run once when the home page opens

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          tagline="Featured Tuitions"
          title="Latest Tuition Batches"
          description="Freshly posted batches from our verified tutors. Find the one that matches your subject and budget."
        />

        {isLoading ? (
          /* ---- Still fetching from the API ---- */
          <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Loading tuitions…</p>
          </div>
        ) : tuitions.length === 0 ? (
          /* ---- No active tuitions in the database at all ---- */
          <FadeIn className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
            <h3 className="text-lg font-bold text-slate-900">
              No tuitions available yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              No live tuition listings right now — check back soon!
            </p>
          </FadeIn>
        ) : (
          /* ---- The grid: every card has equal height and width ---- */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((tuition, index) => (
              <FadeIn
                key={tuition.id}
                delay={index * 0.1}
                className="h-full"
              >
                <div
                  className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Card image with mode badge */}
                  <div className="relative">
                    <img
                      src={tuition.image}
                      alt={tuition.title}
                      className="w-full h-48 object-cover"
                    />
                    <span
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white ${
                        tuition.mode === "Online"
                          ? "bg-emerald-600"
                          : "bg-amber-500"
                      }`}
                    >
                      {tuition.mode}
                    </span>
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 text-xs font-semibold text-slate-700">
                      {tuition.subject}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-grow p-5">
                    <h3 className="font-bold text-lg text-slate-900 leading-snug">
                      {tuition.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2">
                      Class Level: {tuition.classLevel}
                    </p>

                    {/* Tutor + schedule info */}
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                          {tuition.tutor.charAt(0)}
                        </span>
                        {tuition.tutor}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {tuition.mode} Tuition
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        {tuition.days} days / week
                      </p>
                    </div>

                    {/* Bottom row: fee + view details button */}
                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100 mt-5">
                      <p>
                        <span className="text-xl font-extrabold text-emerald-600">
                          ৳{tuition.fee.toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-600"> /month</span>
                      </p>
                      <Link
                        href={`/tuitions/${tuition.id}`}
                        className="flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                      >
                        View Details <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}

        {/* See all button under the grid */}
        <FadeIn className="text-center mt-12">
          <Link
            href="/tuitions"
            className="inline-block px-8 py-3.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            View All Tuitions
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
