import type { Metadata } from "next";

// Shared title for the two Stripe redirect pages
// (both pages are client components, so the metadata lives here)
export const metadata: Metadata = {
  title: "Payment | MentorLagbe",
  description: "Stripe checkout result — payment success or cancel.",
};

// Wraps /payment/success + /payment/cancel
export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
