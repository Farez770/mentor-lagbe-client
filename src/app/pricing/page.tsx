import type { Metadata } from "next";

import PricingPlans from "./PricingPlans";

export const metadata: Metadata = {
  title: "Pricing — Free vs Pro Plans | MentorLagbe",
  description:
    "Compare the Free and Pro plans for Students and Tutors on MentorLagbe. Pro Student ($10) gets unlimited tuition bookmarks (Free plan: max 5); Pro Tutor ($15) gets unlimited tuition posts and a verified badge. Payments are processed securely by Stripe.",
};

export default function PricingPage() {
  return <PricingPlans />;
}
