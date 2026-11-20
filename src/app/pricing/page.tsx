import type { Metadata } from "next";

import PricingPlans from "./PricingPlans";

// ============================================================
// /pricing — the "Pricing / Pro Plans Page" required by the
// assignment:
//   "Stripe subscription tiers for Free vs. Pro Tutors and
//   Students."
//
// The heavy lifting (session state, checkout buttons) happens in
// the client component below — this file only adds the page title
// and description for search engines. Navbar + Footer come from
// the root layout, because /pricing is a public page.
// ============================================================
export const metadata: Metadata = {
  title: "Pricing — Free vs Pro Plans | MentorLagbe",
  description:
    "Compare the Free and Pro plans for Students and Tutors on MentorLagbe. Pro Student ($10) gets priority booking; Pro Tutor ($15) gets unlimited tuition posts and a verified badge. Payments are processed securely by Stripe.",
};

export default function PricingPage() {
  return <PricingPlans />;
}
