import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";

// Popular subjects shown as clickable-looking chips (design only)
const subjects = [
  { name: "Mathematics", icon: "📐", count: 120 },
  { name: "Physics", icon: "⚛️", count: 85 },
  { name: "Chemistry", icon: "🧪", count: 72 },
  { name: "English", icon: "📘", count: 110 },
  { name: "IELTS", icon: "🎓", count: 64 },
  { name: "Programming", icon: "💻", count: 96 },
];

export default function TopSubjects() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          tagline="Top Subjects"
          title="Explore Popular Subjects"
          description="The most in-demand subjects on MentorLagbe right now. Pick one and see all the matching tuition batches."
        />

        {/* Subject cards in a grid */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {subjects.map((subject, index) => (
            <FadeIn key={subject.name} delay={index * 0.08}>
            <Link
              href="/tuitions"
              className="group block bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
            >
              <span className="text-4xl block mb-3">{subject.icon}</span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {subject.name}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {subject.count} batches
              </p>
            </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
