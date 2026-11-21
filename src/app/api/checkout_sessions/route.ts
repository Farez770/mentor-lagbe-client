import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth"; // BetterAuth server instance (reads the session cookie)
import { stripe } from "@/lib/stripe"; // Stripe client (server-only, key from .env.local)

// ============================================================
// POST /api/checkout_sessions — start a Stripe Checkout Session
// for the Pro plan.
//
// Project requirement (UPDATED 2026-11-21):
//   "Set up Stripe Checkout Session for purchasing the Pro Plan
//   (Pro Tutor Plan $15 for unlimited posts & verified badge;
//   Pro Student Plan $10 for unlimited tuition bookmarks —
//   Free students are limited to 5 bookmarks)."
//   (the Pro Student benefit used to say "priority booking";
//   the requirement replaced it with the bookmark limit)
//
// Rules enforced HERE (the browser can never influence prices):
//   - you must be signed in (session cookie, checked server-side)
//   - tutors buy Pro Tutor, students buy Pro Student
//   - the price comes from the fixed catalog below, in cents
//   - admins don't buy; existing pros don't buy twice
//   - redirects go to the required /payment/success + /payment/cancel
// ============================================================

// The only two products we sell. unit_amount is in CENTS the
// way Stripe wants it: $15.00 = 1500, $10.00 = 1000.
const PLANS = {
  tutor: {
    name: "Pro Tutor Plan",
    description: "Unlimited tuition posts & verified tutor badge",
    unitAmount: 1500, // $15.00
  },
  student: {
    name: "Pro Student Plan",
    // shown by Stripe on its hosted checkout page — must match
    // the CURRENT benefit (was "priority booking" before the
    // 2026-11-21 requirement update)
    description: "Unlimited tuition bookmarks (Free plan: max 5)",
    unitAmount: 1000, // $10.00
  },
} as const;

export async function POST(req: Request) {
  try {
    // ---------- 1) who is calling? ----------
    // Same-origin request, so the BetterAuth session cookie is
    // sent automatically — we do NOT trust any user id from
    // the body, it comes from the server-side session.
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        { message: "Please sign in first" },
        { status: 401 },
      );
    }

    // BetterAuth's types only know "student" | "tutor", but the
    // DB can hold "admin" too — String() keeps the checks simple.
    const role = String(session.user.role ?? "student");
    const currentPlan = String(session.user.plan ?? "free").toLowerCase();

    // ---------- 2) no double purchases, no admin purchases ----------
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

    // ---------- 3) which plan did the client ask for? ----------
    // body may also carry the receipt email typed on /pricing
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

    // Optional email from the /pricing form. If the visitor typed
    // one we hand it to Stripe (it pre-fills the checkout page);
    // if the box was empty we fall back to the account email.
    // The server double-checks the format — never trust the client.
    const typedEmail = (body.email ?? "").trim();
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typedEmail);
    if (typedEmail && !emailLooksValid) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // ---------- 4) the plan must match the account's role ----------
    // A student cannot buy the $15 Pro Tutor plan (and vice
    // versa) — so the wrong card can never charge the wrong price.
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

    // ---------- 5) where to send the browser afterwards ----------
    const headersList = await headers();
    const origin =
      headersList.get("origin") ??
      process.env.BETTER_AUTH_URL ??
      "http://localhost:3000";

    // ---------- 6) create the hosted Stripe Checkout ----------
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
      // the two pages required by the assignment
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
      // Our prices are FIXED USD ($10 / $15 as shown on the site),
      // so turn off Stripe's automatic "Choose currency" step —
      // every buyer pays exactly the price the pricing card shows.
      adaptive_pricing: { enabled: false },
      // "who bought what" — written server-side, read back by
      // /api/payments/verify straight from Stripe (unforgeable)
      metadata: { userId: String(session.user.id), plan: requested },
      client_reference_id: String(session.user.id),
      // receipt email: the one typed on /pricing wins, otherwise
      // the signed-in account's email — Stripe pre-fills its form
      customer_email:
        typedEmail || session.user.email || undefined, // pre-fills the form
    });

    // ---------- 7) hand the hosted-page URL to the client ----------
    // The client does `window.location.href = url` and Stripe
    // takes over (card form, receipts, ...).
    if (!checkout.url) {
      return NextResponse.json(
        { message: "Checkout session URL is unavailable" },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    // Pass Stripe's message + status through to the client (the
    // pricing page shows it in a toast).
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
