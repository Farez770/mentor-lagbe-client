import Link from "next/link";
import { MapPin, CalendarDays, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";

// Sample tuition cards (design only, real data will come from the backend)
const tuitions = [
  {
    id: 1,
    title: "Class 9-10 Physics Crash Batch",
    subject: "Physics",
    classLevel: "Class 9-10",
    mode: "Online",
    fee: 2500,
    days: 3,
    tutor: "Rahat Karim",
    image:
      "https://images.unsplash.com/photo-1636466024490-28f0b46a5b5c?w=600&q=80",
  },
  {
    id: 2,
    title: "SSC Math Special Care Batch",
    subject: "Mathematics",
    classLevel: "Class 9-10",
    mode: "Offline",
    fee: 3000,
    days: 4,
    tutor: "Nusrat Jahan",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80",
  },
  {
    id: 3,
    title: "HSC Chemistry Masterclass",
    subject: "Chemistry",
    classLevel: "Class 11-12",
    mode: "Online",
    fee: 3500,
    days: 3,
    tutor: "Tanvir Ahmed",
    image:
      "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=600&q=80",
  },
  {
    id: 4,
    title: "IELTS Guaranteed 7+ Band Program",
    subject: "IELTS",
    classLevel: "Adults",
    mode: "Online",
    fee: 6000,
    days: 5,
    tutor: "Sadia Rahman",
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80",
  },
  {
    id: 5,
    title: "JavaScript & React for Beginners",
    subject: "Programming",
    classLevel: "Adults",
    mode: "Online",
    fee: 4000,
    days: 3,
    tutor: "Mahin Hasan",
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&q=80",
  },
  {
    id: 6,
    title: "English Grammar Foundation Batch",
    subject: "English",
    classLevel: "Class 6-8",
    mode: "Offline",
    fee: 2000,
    days: 2,
    tutor: "Farhana Islam",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
  },
];

export default function FeaturedTuitions() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          tagline="Featured Tuitions"
          title="Latest Tuition Batches"
          description="Freshly posted batches from our verified tutors. Find the one that matches your subject and budget."
        />

        {/* Card grid — every card has equal height and width */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tuitions.map((tuition, index) => (
            <FadeIn key={tuition.id} delay={index * 0.1} className="h-full">
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
                    tuition.mode === "Online" ? "bg-emerald-600" : "bg-amber-500"
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
