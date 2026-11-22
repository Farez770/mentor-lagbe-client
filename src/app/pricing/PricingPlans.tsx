"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@heroui/react";
import { Check, CreditCard, Loader2, Lock, X } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";
import { authClient } from "@/lib/auth-client";
import { startCheckout, type CheckoutPlan } from "@/lib/api/payments";

type Tier = {
  name: string;
  price: number;
  tagline: string;
  features: { text: string; included: boolean }[];
  planId: CheckoutPlan | null;
  highlighted: boolean;
};

const studentTiers: Tier[] = [
  {
    name: "Free Student",
    price: 0,
    tagline: "Everything you need to get started",
    planId: null,
    highlighted: false,
    features: [
      { text: "Browse all tuition posts", included: true },
      { text: "Apply to tuitions", included: true },
      { text: "Track your applications", included: true },
      { text: "Bookmark up to 5 tuitions", included: true },
      { text: "Unlimited tuition bookmarks", included: false },
      { text: "Pro badge on your profile", included: false },
    ],
  },
  {
    name: "Pro Student",
    price: 10,
    tagline: "For learners who want unlimited bookmarks",
    planId: "student",
    highlighted: true,
    features: [
      { text: "Browse all tuition posts", included: true },
      { text: "Apply to tuitions", included: true },
      { text: "Track your applications", included: true },
      { text: "Bookmark up to 5 tuitions", included: true },
      { text: "Unlimited tuition bookmarks", included: true },
      { text: "Pro badge on your profile", included: true },
    ],
  },
];

const tutorTiers: Tier[] = [
  {
    name: "Free Tutor",
    price: 0,
    tagline: "Try teaching with basic reach",
    planId: null,
    highlighted: false,
    features: [
      { text: "Post up to 2 tuitions", included: true },
      { text: "Manage applicants", included: true },
      { text: "Basic profile", included: true },
      { text: "Unlimited tuition posts", included: false },
      { text: "Verified tutor badge", included: false },
      { text: "Priority in search results", included: false },
    ],
  },
  {
    name: "Pro Tutor",
    price: 15,
    tagline: "For tutors who want unlimited reach",
    planId: "tutor",
    highlighted: true,
    features: [
      { text: "Unlimited tuition posts", included: true },
      { text: "Verified tutor badge", included: true },
      { text: "Priority in search results", included: true },
      { text: "Full applicant details", included: true },
      { text: "Featured on home page", included: true },
      { text: "Dedicated support", included: true },
    ],
  },
];

export default function PricingPlans() {
  const router = useRouter();

  const { data: session } = authClient.useSession();

  const isPro = String(session?.user?.plan ?? "free").toLowerCase() === "pro";

  const [busy, setBusy] = useState<CheckoutPlan | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);

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

    const typedEmail = emailRef.current?.value.trim() ?? "";
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typedEmail);
    if (typedEmail && !emailIsValid) {
      toast.warning("Please enter a valid email address");
      emailRef.current?.focus();
      return;
    }

    setBusy(planId);
    try {
      const { url } = await startCheckout(planId, typedEmail || undefined);
      window.location.assign(url);
    } catch (err) {
      toast.warning(
        err instanceof Error ? err.message : "Could not start checkout",
      );
      setBusy(null);
    }
  };

  const renderPlanCard = (tier: Tier) => (
    <div
      key={tier.name}
      className={`flex h-full flex-col rounded-3xl border p-8 transition-shadow ${
        tier.highlighted
          ? "border-slate-900 bg-slate-900 text-white shadow-xl"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3
          className={`text-lg font-bold ${tier.highlighted ? "text-white" : "text-slate-900"}`}
        >
          {tier.name}
        </h3>
        {tier.highlighted && (
          <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900">
            MOST POPULAR
          </span>
        )}
      </div>
      <p
        className={`mt-1 text-sm ${tier.highlighted ? "text-slate-300" : "text-slate-600"}`}
      >
        {tier.tagline}
      </p>

      <p className="mt-6">
        <span className="text-5xl font-extrabold">
          {tier.price === 0 ? "Free" : `$${tier.price}`}
        </span>
        {tier.price !== 0 && (
          <span
            className={`text-sm ${tier.highlighted ? "text-slate-300" : "text-slate-600"}`}
          >
            {" "}
            /month
          </span>
        )}
      </p>

      <ul className="mt-8 flex-grow space-y-3">
        {tier.features.map((feature) => (
          <li key={feature.text} className="flex items-center gap-3 text-sm">
            {feature.included ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                <Check className="h-3 w-3 text-white" />
              </span>
            ) : (
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  tier.highlighted ? "bg-slate-700" : "bg-slate-200"
                }`}
              >
                <X className="h-3 w-3 text-slate-400" />
              </span>
            )}
            <span
              className={
                feature.included
                  ? tier.highlighted
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

      {tier.planId === null ? (
        <div className="mt-8 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-3.5 text-center text-sm font-semibold text-slate-500">
          Everyone starts here — no card needed
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSubscribe(tier.planId!)}
          disabled={busy !== null || isPro}
          className={`mt-8 block w-full cursor-pointer rounded-xl px-6 py-3.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            tier.highlighted
              ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {busy === tier.planId ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening secure checkout…
            </span>
          ) : isPro ? (
            "You're already Pro ✓"
          ) : (
            "Subscribe with Stripe"
          )}
        </button>
      )}
    </div>
  );

  const renderGroup = (title: string, subtitle: string, tiers: Tier[]) => (
    <FadeIn>
      <h2 className="mt-14 text-center text-2xl font-extrabold text-[#173D32]">
        {title}
      </h2>
      <p className="mt-1 text-center text-sm text-slate-600">{subtitle}</p>
      <div className="mx-auto mt-6 grid max-w-4xl gap-6 md:grid-cols-2">
        {tiers.map(renderPlanCard)}
      </div>
    </FadeIn>
  );

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          tagline="Pricing"
          title="Free vs Pro Plans"
          description="Every account starts Free. Upgrade to Pro with Stripe whenever you need more power."
        />

        <FadeIn>
          <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="receipt-email"
              className="block text-sm font-bold text-slate-900"
            >
              Your email for the receipt
            </label>
            <input
              id="receipt-email"
              ref={emailRef}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-2 text-xs text-slate-500">
              Leave it empty to use your account email. After you pick a plan,
              Stripe&apos;s secure page opens for your <b>card information</b>.
            </p>
          </div>
        </FadeIn>

        {renderGroup(
          "For Students",
          "Free students can bookmark 5 tuitions — Pro students unlimited.",
          studentTiers,
        )}

        {renderGroup(
          "For Tutors",
          "Post more tuitions and earn a verified badge.",
          tutorTiers,
        )}

        <FadeIn delay={0.15}>
          <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Lock className="h-4 w-4 text-emerald-600" />
              Your card information stays with Stripe
            </h3>
            <p className="mt-2">
              When you click a Subscribe button we open Stripe&apos;s hosted
              checkout page. You enter your{" "}
              <b>card number, expiry date and CVC</b> there — the fields are
              encrypted and PCI-compliant, and MentorLagbe only receives a
              payment confirmation, never your card details.
            </p>
            <p className="mt-3 flex items-center gap-2 font-medium text-slate-700">
              <CreditCard className="h-4 w-4" />
              Visa · Mastercard · American Express · Discover
            </p>
            <p className="mt-2 text-xs text-slate-400">
              This project runs in Stripe <b>test mode</b>: use test card{" "}
              <code className="rounded bg-slate-100 px-1">
                4242 4242 4242 4242
              </code>
              , any future expiry, any CVC. Problems?{" "}
              <Link href="/" className="underline hover:text-emerald-600">
                Contact support
              </Link>
              .
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
