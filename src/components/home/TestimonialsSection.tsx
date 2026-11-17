import { Star, Quote } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";

// Sample testimonials (design only)
const testimonials = [
  {
    name: "Ayesha Siddika",
    role: "Class 10 Student",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "I found an amazing Physics batch within two days of joining. The application process was so simple and my tutor accepted me the same week!",
  },
  {
    name: "Rahat Karim",
    role: "Pro Tutor",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "Managing my batches and applicants from one dashboard saves me hours every week. The Pro plan paid for itself in my first month.",
  },
  {
    name: "Mahin Hasan",
    role: "Programming Mentor",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    rating: 4,
    text: "The admin-approved listing system builds real trust. Students know every batch they see has been reviewed. My React batch filled up fast.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          tagline="Testimonials"
          title="What Our Users Say"
          description="Real feedback from students and tutors who found each other through MentorLagbe."
        />

        {/* Testimonial cards — equal height in a grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <FadeIn key={item.name} delay={index * 0.12} className="h-full">
              <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-2xl p-7 hover:shadow-lg transition-shadow h-full">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${
                      index < item.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <Quote className="w-8 h-8 text-emerald-100 fill-emerald-100 mb-2" />
              <p className="text-slate-600 text-sm leading-7 flex-grow">
                {item.text}
              </p>

              {/* Person row at the bottom */}
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {item.name}
                  </p>
                  <p className="text-sm text-slate-600">{item.role}</p>
                </div>
              </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
