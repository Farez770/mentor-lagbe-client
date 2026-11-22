"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, CalendarDays, ArrowRight } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading";
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";
import type { Tuition } from "@/components/tuitions/TuitionCard";
import { getTuitions } from "@/lib/api/tuitions";


export default function FeaturedTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    getTuitions()
      .then((data) => {
        if (!alive) return;
        setTuitions(
          data.tuitions
            .filter((item) => item.approvalStatus === "approved")
            .filter((item) => item.isActive)
            .slice(0, 6)
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
        console.warn("Could not load featured tuitions:", err);
        if (alive) setTuitions([]);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          tagline="Featured Tuitions"
          title="Latest Tuition Batches"
          description="Freshly posted batches from our verified tutors. Find the one that matches your subject and budget."
        />

        {isLoading ? (
          <LoadingSpinner label="Loading tuitions…" />
        ) : tuitions.length === 0 ? (
          <FadeIn className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
            <h3 className="text-lg font-bold text-slate-900">
              No tuitions available yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              No live tuition listings right now — check back soon!
            </p>
          </FadeIn>
        ) : (
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

                  <div className="flex flex-col flex-grow p-5">
                    <h3 className="font-bold text-lg text-slate-900 leading-snug">
                      {tuition.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2">
                      Class Level: {tuition.classLevel}
                    </p>

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
