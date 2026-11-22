# MentorLagbe — Tuition & Mentorship Platform

## Project Name

**MentorLagbe** — A full-stack tuition and mentorship marketplace.

This repository contains the **Next.js frontend**. The Express.js + MongoDB backend is maintained separately in the sibling folder `../mentor-lagbe-server`.

**Project:** Programming Hero Assignment 9

## Purpose

MentorLagbe connects students with tutors. Tutors can post tuition listings, students can browse and apply for suitable opportunities, and administrators can review tuition posts, manage users, and monitor platform payments.

## Live URL

```text
https://mentor-lagbe-client-jade.vercel.app/
```

## Admin Credentials

| Field    | Value            |
| -------- | ---------------- |
| Email    | `admin@one.com`  |
| Password | `Admin1@one.com` |
| Role     | `admin`          |

Sign in at `/sign-in`. The role is retrieved from the database, and an admin is redirected to `/dashboard/admin`.

To give an existing user admin access, use the admin-only role change endpoint `PATCH /api/admin/users/:id` or set `role: "admin"` directly in MongoDB.

## Key Features

- **Role-based authentication** — Student, Tutor, and Admin accounts with Better Auth, signed JWT access tokens, and role-protected API routes.
- **Public tuition browsing** — `/tuitions` with server-side search (`q`) and filters for subject, class level, and teaching mode. Only approved and active posts are visible. Filter state is stored in the URL, making results shareable and persistent after refresh.
- **Tuition details** — Full tuition information, tutor details, Pro Tutor badge, application, and bookmark actions.
- **Tutor dashboard** — Post tuition, manage personal listings, view received applicants, and track statistics such as total posts, active posts, applicants, and current plan.
- **Student dashboard** — Dashboard overview, application management, saved tuition bookmarks, and profile editing.
- **Admin dashboard** — Platform statistics, tuition approval and rejection, user and role management, and transaction monitoring.
- **Payments** — Stripe Checkout for Pro plans (Tutor: $15, Student: $10), with server-side verification, signed webhooks, and duplicate-safe payment records.
- **Image uploads** — Tuition banner and profile image uploads through ImgBB.
- **Responsive UI** — Collapsible desktop sidebar, top bar, mobile drawer, dark/light theme, carousel, animations, and toast notifications.
- **Security** — Backend JWT verification against Better Auth JWKS, ownership checks on tutor/student routes, and whitelisted profile updates.

## Technology Stack

| Category       | Technologies               |
| -------------- | -------------------------- |
| Frontend       | Next.js, React, TypeScript |
| Backend        | Node.js, Express.js        |
| Database       | MongoDB                    |
| Authentication | Better Auth, JWT           |
| Styling        | Tailwind CSS, HeroUI       |
| Payment        | Stripe                     |
| Image Upload   | ImgBB                      |
| Icons          | Lucide React               |
| Animations     | Framer Motion              |
| Notifications  | Toast notifications        |

## NPM Packages Used

### Dependencies

| Package                                           | Used for                                           |
| ------------------------------------------------- | -------------------------------------------------- |
| `next`                                            | React framework, App Router, and server components |
| `react`, `react-dom`                              | UI runtime                                         |
| `@heroui/react`, `@heroui/styles`                 | HeroUI v3 component library and styles             |
| `@base-ui/react`                                  | Headless UI primitives                             |
| `better-auth`, `@better-auth/mongo-adapter`       | Authentication, sessions, and JWT                  |
| `mongodb`                                         | MongoDB database driver                            |
| `stripe`, `@stripe/stripe-js`                     | Payment checkout and verification                  |
| `lucide-react`                                    | Icons                                              |
| `framer-motion`                                   | Animations                                         |
| `embla-carousel-react`, `embla-carousel-autoplay` | Testimonial carousel                               |
| `class-variance-authority`, `cn`, `shadcn`        | Styling helpers and UI utilities                   |
| `tw-animate-css`                                  | Tailwind animation utilities                       |

### Dev Dependencies

| Package                                                         | Used for                                 |
| --------------------------------------------------------------- | ---------------------------------------- |
| `typescript`, `@types/node`, `@types/react`, `@types/react-dom` | Type checking and TypeScript definitions |
| `tailwindcss`, `@tailwindcss/turbopack`                         | CSS styling (Tailwind CSS v4)            |
| `eslint`, `eslint-config-next`                                  | Code linting                             |
| `babel-plugin-react-compiler`                                   | React Compiler support                   |

## Run Locally

Follow these steps to run the complete MentorLagbe application on your local machine.

### Prerequisites

Make sure you have installed:

- Node.js (LTS version recommended)
- npm
- MongoDB Atlas account or a local MongoDB instance
- Git

### 1. Clone the Frontend Repository

```bash
git clone https://github.com/Farez770/mentor-lagbe-client.git
cd mentor-lagbe-client
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Frontend Environment Variables

Create a `.env.local` file in the frontend root directory.

Add the required environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Add any other environment variables required by your frontend configuration, such as Better Auth settings.

### 4. Clone the Backend Repository

Open another terminal and clone the Express backend repository:

```bash
git clone https://github.com/Farez770/mentor-lagbe-server.git
cd mentor-lagbe-server
```

### 5. Install Backend Dependencies

```bash
npm install
```

### 6. Configure Backend Environment Variables

Create a `.env` file in the backend root directory.

Configure the required backend environment variables, including:

- MongoDB connection URI
- Better Auth secret and configuration
- Client URL and CORS configuration
- ImgBB API key
- Stripe secret key
- Stripe webhook secret
- Any additional JWT or authentication configuration used by the backend

Use `.env.example` as a reference if provided. Never commit real credentials or secret keys to GitHub.

### 7. Start the Backend Server

Run the backend development command:

```bash
npm run dev
```

The backend should be available at:

```text
http://localhost:5000
```

### 8. Start the Frontend Application

In a separate terminal, navigate to the frontend project directory and run:

```bash
npm run dev
```

The frontend should be available at:

```text
http://localhost:3000
```

Open the application in your browser:

**http://localhost:3000**

> Make sure the backend is running and `NEXT_PUBLIC_API_URL` points to the correct backend URL before using the application.

## Available Scripts

Run these commands from the frontend project directory:

| Command         | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the development server     |
| `npm run build` | Build the production application |
| `npm run start` | Start the production server      |
| `npm run lint`  | Run ESLint                       |

### Useful Checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Environment Variable Security

- Keep frontend local environment variables in `.env.local`.
- Keep backend secrets in the backend `.env` file.
- Add `.env`, `.env.local`, and other secret files to `.gitignore`.
- Never push database credentials, API keys, authentication secrets, or Stripe secret keys to GitHub.
- Provide `.env.example` files with placeholder values for other developers.

---

## **MentorLagbe — Connecting Students with the Right Mentors.**

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
