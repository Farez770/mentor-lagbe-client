import FadeIn from "@/components/shared/FadeIn";

// Shared section heading so every section on the site looks the same.
// It fades in when scrolled into view.
export default function SectionHeading({
  tagline,
  title,
  description,
}: {
  tagline: string;
  title: string;
  description: string;
}) {
  return (
    <FadeIn className="text-center max-w-2xl mx-auto mb-12">
      <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
        {tagline}
      </span>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-4 text-base md:text-lg text-slate-600">{description}</p>
    </FadeIn>
  );
}
