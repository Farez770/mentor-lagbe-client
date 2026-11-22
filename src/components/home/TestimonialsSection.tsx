"use client";

import { Star, Quote } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

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
  {
    name: "Farhana Islam",
    role: "Class 8 Student",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
    text: "My English tutor explains grammar so clearly. Booking sessions and tracking my application status in the dashboard is very easy.",
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

        <FadeIn delay={0.15}>
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[
              Autoplay({
                delay: 4000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((item) => (
                <CarouselItem
                  key={item.name}
                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <div className="flex flex-col h-full bg-slate-100 border border-slate-200 rounded-2xl p-6 md:p-7 hover:shadow-lg transition-shadow">
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

                    <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-200">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={44}
                        height={44}
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
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden sm:flex size-11 cursor-pointer border-2 border-emerald-500 bg-white text-emerald-600 transition-colors duration-200 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white active:border-emerald-700 active:bg-emerald-700 active:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2" />
            <CarouselNext className="hidden sm:flex cursor-pointer size-11 border-2 border-emerald-500 bg-white text-emerald-600 transition-colors duration-200 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white active:border-emerald-700 active:bg-emerald-700 active:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2" />
          </Carousel>
        </FadeIn>

        <p className="text-center text-xs text-slate-500 mt-6 sm:hidden">
          Swipe to see more reviews
        </p>
      </div>
    </section>
  );
}
