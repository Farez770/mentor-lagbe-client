# MentorLagbe — Client

Next.js tuition/mentorship platform (Programming Hero Assignment 9). All app code lives under `src/app` (App Router). Backend is a **separate git repo** in the sibling directory `../mentor-lagbe-server` (Express + MongoDB); this client calls it over HTTP via `NEXT_PUBLIC_API_URL` — never create API routes here that duplicate backend logic.

## Commands

- `npm run dev` — dev server (Turbopack is the default in Next 16; no `--turbopack` flag needed)
- `npm run build` — production build; this is the real verification step (catches `cacheComponents` violations)
- `npm run lint` — ESLint 9 flat config (`eslint.config.mjs`, next/core-web-vitals + typescript presets)
- `npx tsc --noEmit` — typecheck (there is **no** `typecheck` script)

## Toolchain gotchas

- **`cacheComponents: true` is enabled** in `next.config.ts` (along with `reactCompiler` and `partialPrefetching`). Components doing dynamic data fetching must be wrapped in `<Suspense>` or use `use cache`; prerendering a page that awaits uncached data without Suspense fails the build. This is not in older Next.js tutorials.
- `params` and `searchParams` are **Promises** in Next 16 — `await` them in pages/routes.
- Path alias `@/*` → `./src/*` (see `tsconfig.json`). TypeScript is strict.
- **HeroUI v3** (not v2/NextUI): no `HeroUIProvider` exists or is needed — styles are loaded once via `@import "@heroui/styles"` at the top of `src/app/globals.css`. Import components directly from `@heroui/react`. Do not follow NextUI/HeroUI v2 provider examples.
- **Fonts**: Geist Sans / Geist Mono load via `next/font/google` in `src/app/layout.tsx`. Apply the font with the arbitrary utility `font-[family-name:var(--font-geist-sans)]` on `<body>` — the `@theme inline` mapping of `--font-sans: var(--font-geist-sans)` compiles to a broken circular variable in this setup, so `font-sans` utilities are unreliable here.
- Tailwind v4 (CSS-first): theme tokens live in `@theme` blocks in `globals.css`; there is no `tailwind.config.js`.
- **Dev server terminal output is logged to `.next/dev/logs/next-development.log`** (JSON lines, includes browser-side runtime errors echoed as `source: "Browser"`). When the user says "the error is in the terminal", read the tail of this file instead of asking them to paste it.

## Environment

- Secrets/config go in `.env.local` (gitignored via `.env*`); only `NEXT_PUBLIC_*` vars are exposed to the browser. No env files are committed.

## Stale-block note

`next-env.d.ts` is auto-generated and gitignored; do not edit or commit it.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
