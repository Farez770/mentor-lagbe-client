# MentorLagbe — Tuition & Mentorship Platform

## Project Name

**MentorLagbe** — a full-stack tuition/mentorship marketplace (client application).

## Purpose

MentorLagbe connects students with tutors. Tutors post tuition listings, students browse and apply for them, and admins review new posts, manage users and view platform payments. This repository is the **Next.js frontend**; the Express + MongoDB backend lives in the sibling folder `../mentor-lagbe-server`. This is Programming Hero Assignment 9.

## Live URL

> **Replace before submission:** add your deployed frontend URL here.

```text
https://your-mentor-lagbe-domain.vercel.app
```

Local development: `http://localhost:3000` (backend: `http://localhost:5000`).

## Admin Credentials

> **Replace before submission:** add the real admin account created in your database.

| Field    | Value                 |
| -------- | --------------------- |
| Email    | `admin@example.com`   |
| Password | `your-admin-password` |
| Role     | `admin`               |

Sign in at `/sign-in`. The role is read from the database, so an admin is automatically redirected to `/dashboard/admin`. To give an existing user admin access, use the admin-only role change endpoint `PATCH /api/admin/users/:id` (or set `role: "admin"` directly in MongoDB).

## Key Features

- **Role-based authentication** — student, tutor and admin accounts with Better Auth, signed JWT access tokens and role-protected API routes.
- **Public tuition browsing** — `/tuitions` with server-side search (`q`) and filters for subject, class level and mode; only approved + active posts are visible. Filter state lives in the URL, so results are shareable and survive refresh.
- **Tuition details** — full post information, tutor details with a “Pro Tutor” badge, apply and bookmark actions.
- **Tutor dashboard** — post a tuition, manage own posts, view received applicants and see real stats (total posts, live posts, applicants, current plan).
- **Student dashboard** — overview stats, my applications, saved bookmarks and profile editing.
- **Admin dashboard** — platform stats, approve/reject pending tuitions, manage users and roles, and view transactions.
- **Payments** — Stripe Checkout for Pro plans (tutor $15, student $10) with server-side verification plus a signed webhook; duplicate-safe payment records.
- **Image uploads** — tuition and profile images uploaded through ImgBB.
- **Responsive UI** — collapsible desktop sidebar with a top bar, mobile drawer, dark/light theme, carousel, animations and toast feedback.
- **Security** — JWT verified against Better Auth JWKS on the backend, ownership checks on every tutor/student route, and safe whitelisted profile updates.

## npm Packages Used

### Dependencies

| Package                                           | Used for                                         |
| ------------------------------------------------- | ------------------------------------------------ |
| `next`                                            | React framework, App Router, server components   |
| `react`, `react-dom`                              | UI runtime                                       |
| `@heroui/react`, `@heroui/styles`                 | HeroUI v3 component library and styles           |
| `@base-ui/react`                                  | Headless UI primitives                           |
| `better-auth`, `@better-auth/mongo-adapter`       | Authentication, sessions and JWT                 |
| `mongodb`                                         | Database driver (shared with the backend design) |
| `stripe`, `@stripe/stripe-js`                     | Payment checkout and verification                |
| `lucide-react`                                    | Icons                                            |
| `framer-motion`                                   | Animations                                       |
| `embla-carousel-react`, `embla-carousel-autoplay` | Testimonial carousel                             |
| `class-variance-authority`, `cn`, `shadcn`        | Styling helpers and UI utilities                 |
| `tw-animate-css`                                  | Tailwind animation utilities                     |

### Dev Dependencies

| Package                                                         | Used for                  |
| --------------------------------------------------------------- | ------------------------- |
| `typescript`, `@types/node`, `@types/react`, `@types/react-dom` | Type checking and types   |
| `tailwindcss`, `@tailwindcss/turbopack`                         | CSS styling (Tailwind v4) |
| `eslint`, `eslint-config-next`                                  | Linting                   |
| `babel-plugin-react-compiler`                                   | React Compiler support    |

## Quick Start

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. The backend must be running on port `5000` and `NEXT_PUBLIC_API_URL` must point to it.

Useful checks:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
