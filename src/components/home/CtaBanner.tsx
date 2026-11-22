import Link from "next/link";
import FadeIn from "@/components/shared/FadeIn";

export default function CtaBanner() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <FadeIn>
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl px-6 py-14 md:px-16 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-14 -left-10 w-56 h-56 rounded-full bg-white/10" />

          <h2 className="text-3xl md:text-4xl font-extrabold text-white relative">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="mt-4 text-emerald-100 max-w-xl mx-auto relative">
            Join thousands of students and tutors already using MentorLagbe.
            Create your free account today — no credit card needed.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 relative">
            <Link
              href="/sign-up"
              className="px-8 py-3.5 rounded-xl font-semibold bg-white text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              href="/tuitions"
              className="px-8 py-3.5 rounded-xl font-semibold border-2 border-white text-white hover:bg-white/10 transition-colors"
            >
              Browse Tuitions
            </Link>
          </div>
        </div>
        </FadeIn>
      </div>
    </section>
  );
}
