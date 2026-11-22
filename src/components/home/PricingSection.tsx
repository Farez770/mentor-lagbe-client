"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@heroui/react";
import { Check, Loader2, X } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";
import { authClient } from "@/lib/auth-client";
import { startCheckout, type CheckoutPlan } from "@/lib/api/payments";

const plans: {
  id: CheckoutPlan;
  name: string;
  price: number;
  tagline: string;
  features: { text: string; included: boolean }[];
  highlighted: boolean;
}[] = [
  {
    id: "student",
    name: "Pro Student",
    price: 10,
    tagline: "For learners who want unlimited bookmarks",
    features: [
      { text: "Apply to unlimited tuitions", included: true },
      { text: "Bookmark unlimited tuitions", included: true },
      { text: "Pro badge on your profile", included: true },
      { text: "Post tuitions as a tutor", included: false },
      { text: "Ad-free experience", included: true },
    ],
    highlighted: false,
  },
  {
    id: "tutor",
    name: "Pro Tutor",
    price: 15,
    tagline: "For tutors who want unlimited reach",
    features: [
      { text: "Unlimited tuition posts", included: true },
      { text: "Verified tutor badge", included: true },
      { text: "Priority in search results", included: true },
      { text: "Full applicant details", included: true },
      { text: "Featured on home page", included: true },
      { text: "Dedicated support", included: true },
    ],
    highlighted: true,
  },
];

export default function PricingSection() {
  const router = useRouter();

  const { data: session } = authClient.useSession();

  const [busy, setBusy] = useState<CheckoutPlan | null>(null);

  const isPro = String(session?.user?.plan ?? "free").toLowerCase() === "pro";

  const onSubscribe = async (planId: CheckoutPlan) => {
    if (!session) {
      toast.warning("Please sign in to upgrade to Pro");
      router.push("/sign-in");
      return;
    }

    if (isPro) {
      toast.success("You already have the Pro plan 🎉");
      return;
    }

    setBusy(planId);
    try {
      const { url } = await startCheckout(planId);
      window.location.assign(url);
    } catch (err) {
      toast.warning(
        err instanceof Error ? err.message : "Could not start checkout",
      );
      setBusy(null);
    }
  };

  return (
    <section id="pricing" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          tagline="Pricing"
          title="Free vs Pro Plans"
          description="Everyone starts on the Free plan. Upgrade with Stripe whenever you need more power."
        />

        <div className="grid gap-6 max-w-4xl mx-auto md:grid-cols-2">
          {plans.map((plan, index) => (
            <FadeIn key={plan.name} delay={index * 0.15} className="h-full">
            <div
              className={`flex flex-col rounded-3xl p-8 border transition-shadow h-full ${
                plan.highlighted
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-lg font-bold ${
                    plan.highlighted ? "text-white" : "text-slate-900"
                  }`}
                >
                  {plan.name}
                </h3>
                {plan.highlighted && (
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-bold">
                    MOST POPULAR
                  </span>
                )}
              </div>
              <p
                className={`mt-1 text-sm ${
                  plan.highlighted ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {plan.tagline}
              </p>

              <p className="mt-6">
                <span className="text-5xl font-extrabold">${plan.price}</span>
                <span
                  className={`text-sm ${
                    plan.highlighted ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {" "}
                  /month
                </span>
              </p>

              <ul className="mt-8 space-y-3 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3 text-sm">
                    {feature.included ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    ) : (
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          plan.highlighted ? "bg-slate-700" : "bg-slate-200"
                        }`}
                      >
                        <X className="w-3 h-3 text-slate-400" />
                      </span>
                    )}
                    <span
                      className={
                        feature.included
                          ? plan.highlighted
                            ? "text-slate-200"
                            : "text-slate-700"
                          : "text-slate-400 line-through"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => onSubscribe(plan.id)}
                disabled={busy !== null || isPro}
                className={`mt-8 block w-full rounded-xl px-6 py-3.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  plan.highlighted
                    ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {busy === plan.id ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to Stripe…
                  </span>
                ) : isPro ? (
                  "You're already Pro ✓"
                ) : (
                  "Subscribe with Stripe"
                )}
              </button>
            </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <p className="text-center text-sm md:text-base text-slate-600 mt-8">
          Every account starts on the <b>Free plan</b> — students can apply to
          tuitions and bookmark up to <b>5 tuitions</b>, tutors can post up to{" "}
          <b>2 tuitions</b>. Upgrade anytime.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
