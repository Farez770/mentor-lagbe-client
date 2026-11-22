import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";


const PLANS = {
  tutor: {
    name: "Pro Tutor Plan",
    description: "Unlimited tuition posts & verified tutor badge",
    unitAmount: 1500,
  },
  student: {
    name: "Pro Student Plan",
    description: "Unlimited tuition bookmarks (Free plan: max 5)",
    unitAmount: 1000,
  },
} as const;

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        { message: "Please sign in first" },
        { status: 401 },
      );
    }

    const role = String(session.user.role ?? "student");
    const currentPlan = String(session.user.plan ?? "free").toLowerCase();

    if (currentPlan === "pro") {
      return NextResponse.json(
        { message: "You already have the Pro plan" },
        { status: 400 },
      );
    }
    if (role === "admin") {
      return NextResponse.json(
        { message: "Admin accounts don't need to upgrade" },
        { status: 403 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      plan?: string;
      email?: string;
    };
    const requested = body.plan;
    if (requested !== "tutor" && requested !== "student") {
      return NextResponse.json(
        { message: "Choose the Pro Tutor or Pro Student plan" },
        { status: 400 },
      );
    }

    const typedEmail = (body.email ?? "").trim();
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typedEmail);
    if (typedEmail && !emailLooksValid) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    const rolePlan = role === "tutor" ? "tutor" : "student";
    if (requested !== rolePlan) {
      const wanted = requested === "tutor" ? "Pro Tutor" : "Pro Student";
      const yours = rolePlan === "tutor" ? "Pro Tutor" : "Pro Student";
      return NextResponse.json(
        {
          message: `Your ${role} account can only buy the ${yours} plan (not ${wanted})`,
        },
        { status: 400 },
      );
    }

    const plan = PLANS[requested]; // trusted server-side price

    const headersList = await headers();
    const origin =
      headersList.get("origin") ??
      process.env.BETTER_AUTH_URL ??
      "http://localhost:3000";

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment", // one-time payment (not a subscription)
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.unitAmount, // from OUR catalog
            product_data: {
              name: plan.name,
              description: plan.description,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
      adaptive_pricing: { enabled: false },
      metadata: { userId: String(session.user.id), plan: requested },
      client_reference_id: String(session.user.id),
      customer_email:
        typedEmail || session.user.email || undefined, // pre-fills the form
    });

    if (!checkout.url) {
      return NextResponse.json(
        { message: "Checkout session URL is unavailable" },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    const statusCode =
      typeof err === "object" &&
      err !== null &&
      "statusCode" in err &&
      typeof (err as { statusCode?: unknown }).statusCode === "number"
        ? (err as { statusCode: number }).statusCode
        : 500;
    return NextResponse.json({ message }, { status: statusCode });
  }
}
