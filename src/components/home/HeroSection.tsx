import Link from "next/link";
import { Search, Users, BookOpen, Award } from "lucide-react";
import FadeIn from "@/components/shared/FadeIn";
import Float from "@/components/shared/Float";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-emerald-50 via-white to-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-20 md:pt-20 md:pb-28 grid items-center gap-12 lg:grid-cols-2">
        {/* Left: text side */}
        <div className="text-center lg:text-left">
          <FadeIn>
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-5">
              Bangladesh&apos;s Smart Tuition Platform
            </span>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight text-slate-900">
              Find Your Ideal <span className="text-emerald-600">Tutor</span> or
              Mentorship <span className="text-amber-500">Batch</span> Today
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-5 text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0">
              MentorLagbe connects students with verified tutors. Search tuition
              batches by subject, class level, and budget — then apply in a
              single click.
            </p>
          </FadeIn>

          {/* Search bar (design only) */}
          <FadeIn delay={0.3}>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center flex-grow bg-white border border-slate-300 rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search subject, e.g. Physics"
                  className="w-full outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
              <Link
                href="/tuitions"
                className="text-center px-7 py-3.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Browse Tuitions
              </Link>
            </div>
          </FadeIn>

          {/* Small stat row under the search bar (wraps on small screens) */}
          <FadeIn delay={0.4}>
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-10 lg:gap-12">
              <div>
                <p className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-slate-900">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" /> 2,500+
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">Active Students</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-slate-900">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" /> 800+
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">Tuition Batches</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-slate-900">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" /> 350+
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">Verified Tutors</p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Right: image side with entrance animation and floating cards */}
        <FadeIn delay={0.3} className="relative">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c81fd05?w=800&q=80"
            alt="Students learning together"
            className="w-full h-72 sm:h-96 lg:h-[480px] object-cover rounded-3xl shadow-xl"
          />

          {/* Floating mini cards on top of the image (they gently bob).
              They use smaller text/padding on mobile so they never
              stick out past the screen edge. */}
          <Float delay={0.5} className="absolute -bottom-4 sm:-bottom-5 left-3 sm:left-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg px-3 py-2.5 sm:px-5 sm:py-4 flex items-center gap-2 sm:gap-3">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 flex items-center justify-center text-base sm:text-lg shrink-0">
                🎯
              </span>
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                  1-on-1 Mentorship
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600 whitespace-nowrap">
                  Personalized guidance
                </p>
              </div>
            </div>
          </Float>

          <Float delay={1.2} className="absolute top-4 sm:top-6 right-3 sm:right-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg px-3 py-2.5 sm:px-5 sm:py-4 flex items-center gap-2 sm:gap-3">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-base sm:text-lg shrink-0">
                ✅
              </span>
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                  Verified Tutors
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600 whitespace-nowrap">
                  Admin approved
                </p>
              </div>
            </div>
          </Float>
        </FadeIn>
      </div>
    </section>
  );
}
