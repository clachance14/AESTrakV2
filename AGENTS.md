# Repository Guidelines

## Project Structure & Module Organization

- Core routes and layouts live in `src/app/`; each folder under it represents an App Router segment.
- Feature logic stays inside `src/features/<domain>` (auth, organizations, purchase-orders, quantity-surveys, imports, dashboard, alerts).
- Shared UI primitives belong in `src/components/ui/`; keep feature-specific components near their feature.
- Supabase helpers and other cross-cutting utilities sit in `src/libs/`; shared TypeScript shapes live in `src/types/`.
- Tests default to `src/__tests__/`, but colocated `*.test.tsx` files are acceptable when they clarify intent.

## Build, Test, and Development Commands

- `npm run dev` starts the Next.js dev server with Turbopack enabled.
- `npm run build` creates a production build; `npm run start` serves it locally.
- `npm run lint` runs ESLint against the whole repo; `npm run type-check` executes `tsc --noEmit`.
- `npm run test` runs the Vitest suite once, `npm run test:watch` keeps it hot, and `npm run coverage` emits text and lcov reports.
- `npm run format` checks formatting; `npm run format:write` applies Prettier fixes.

## Coding Style & Naming Conventions

- TypeScript strict mode is enforced; prefer `type` aliases and explicit return types for exported functions.
- Prettier (2 spaces, single quotes, 100 character width) and ESLint guard formatting; lint-staged applies both on commit.
- Use PascalCase for React components, camelCase for variables and hooks, and SCREAMING_SNAKE_CASE for shared constants.
- Group imports as builtin, external, internal, then relative to satisfy the `import/order` rule.

## Testing Guidelines

- Vitest with jsdom and Testing Library powers unit and component tests; jest-dom matchers are preloaded via `vitest.setup.ts`.
- Name specs `*.test.ts` or `*.test.tsx` and mirror the source path (`src/features/dashboard/dashboard.test.tsx`).
- Cover utilization math, alert thresholds, and data import parsers; target at least 80% statement coverage on business logic modules.

## Commit & Pull Request Guidelines

- Follow conventional style prefixes (`feat:`, `fix:`, `chore:`, `refactor:`) plus a short scope, e.g., `feat: add QS import validator`.
- Run `npm run lint` and `npm run test` before pushing; Husky already runs lint-staged on commit.
- Pull requests should link issues or tickets, outline changes, list verification steps, and include screenshots for UI updates.

## Security & Configuration Tips

- Keep environment secrets in `.env.local`; update `.env.example` whenever new variables are introduced.
- Supabase clients throw if required variables are missing, so confirm local env files before running builds or tests.
- Document new Row Level Security policies or exceptions in migration PRs, and never ship tables without RLS enabled.

## Documentation References

- `docs/README.md` – Entry point for documentation structure and contribution guidelines.
- `docs/product/PRD.md` – Product requirements, goals, and MVP scope.
- `docs/architecture/TECHNICAL_ARCHITECTURE.md` – System blueprint covering routes, data flows, and integrations.
- `docs/architecture/data-dictionary.md` – Supabase table definitions, enums, RLS, and index guidance.
- `docs/architecture/site-map.md` – Route hierarchy with access rules and key UI states.
- `docs/product/feature-briefs/` – Feature briefs (`TEMPLATE.md`, `dashboard.md`, `imports.md`, `alerts.md`, `purchase-orders.md`, `quantity-surveys.md`, `settings.md`).
- `docs/process/onboarding.md` – Environment setup, branching workflow, and tooling expectations.
- `docs/process/supabase-setup.md` – Supabase provisioning, RLS policies, and CLI commands.
- `docs/process/vercel-setup.md` – Deployment configuration and environment variable checklist.
- `docs/process/testing-checklist.md` – Pre-PR testing steps covering automation, accessibility, and data checks.
- `docs/process/backlog.md` – Master task checklist aligned with roadmap phases and cross-cutting work.
- `docs/playbooks/manual-billing.md` – Manual subscription management process until Stripe automation ships.
- `docs/playbooks/import-troubleshooting.md` – Guidance for resolving PO/QS import issues.
- `docs/decisions/ADR-001-billing-strategy.md` – Rationale for deferring Stripe integration post-production.
- `docs/release-notes/RELEASE_TEMPLATE.md` – Template for documenting releases and deploy notes.
