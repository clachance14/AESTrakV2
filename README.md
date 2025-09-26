# AESTrak

AESTrak is a purchase order tracking platform for construction teams, built on Next.js 15 with Supabase for data and authentication.

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project credentials (URL, anon key, service role key)
- Vercel project (optional, for hosting)

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in your Supabase values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` to access the app shell.

## Available Scripts

- `npm run dev` – start the local Next.js server (Turbopack).
- `npm run build` – create an optimized production build.
- `npm run start` – run the built app in production mode.
- `npm run lint` – lint the project with ESLint.
- `npm run type-check` – run the TypeScript compiler without emitting files.
- `npm run format` / `npm run format:write` – check or apply Prettier formatting.
- `npm run test` – execute the Vitest suite once.
- `npm run test:watch` – run tests in watch mode.
- `npm run coverage` – generate coverage reports.

## Tooling & Conventions

- **Styling**: Tailwind CSS v4 with the App Router.
- **Code Quality**: ESLint, Prettier, Husky + lint-staged pre-commit pipeline.
- **Testing**: Vitest with Testing Library and jsdom environment.
- **Structure**: Feature-first directories under `src/features`, shared utilities in `src/libs`, UI primitives in `src/components/ui`, and shared types in `src/types`.

## Next Steps

- Build Supabase migrations for purchase orders and quantity surveys.
- Implement authentication and multi-tenant organization flows.
- Wire Excel import processing and dashboard visualizations per the project context.
