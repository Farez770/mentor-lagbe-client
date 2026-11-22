import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment | MentorLagbe",
  description: "Stripe checkout result — payment success or cancel.",
};

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
