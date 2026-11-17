import { UserPlus, Search, FileSignature, Rocket } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";

// The 4 simple steps of using MentorLagbe
const steps = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up as a Student or a Tutor in less than a minute and set up your profile.",
  },
  {
    icon: Search,
    title: "Browse & Filter",
    description:
      "Students search tuition batches by subject, class level, mode, and monthly budget.",
  },
  {
    icon: FileSignature,
    title: "Apply for Tuition",
    description:
      "Found the right batch? Apply with your phone, preferred schedule, and a short note.",
  },
  {
    icon: Rocket,
    title: "Start Learning",
    description:
      "Tutors accept applications, students get accepted, and the learning journey begins.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          tagline="Simple Process"
          title="How MentorLagbe Works"
          description="From signing up to starting your first class — everything happens in four easy steps."
        />

        {/* Step cards with number badges */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <FadeIn key={step.title} delay={index * 0.12} className="h-full">
              <div className="relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow h-full">
                {/* Step number in the corner */}
                <span className="absolute top-4 right-4 text-5xl font-extrabold text-slate-200">
                  {index + 1}
                </span>
                <span className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-5">
                  <step.icon className="w-6 h-6 text-white" />
                </span>
                <h3 className="font-bold text-lg text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm md:text-base text-slate-600 leading-7">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
