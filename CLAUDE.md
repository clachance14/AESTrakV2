# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AESTrak is a construction purchase order (PO) tracking platform that helps teams monitor spend through quantity survey (QS) imports, surface utilization risks, and support decision making with dashboards and audit-ready reporting. Built with Next.js 15 App Router, Supabase (auth + PostgreSQL), and Tailwind CSS.

## Development Commands

```bash
# Development
npm run dev                 # Start dev server with Turbopack
npm run build              # Production build with Turbopack
npm run start              # Run production build

# Code Quality
npm run lint               # ESLint check
npm run type-check         # TypeScript validation (no emit)
npm run format             # Prettier check
npm run format:write       # Apply Prettier formatting

# Testing
npm test                   # Run Vitest suite once
npm run test:watch         # Run tests in watch mode
npm run coverage           # Generate coverage reports

# Database
npm run db:generate-types  # Generate TypeScript types from Supabase schema
npm run db:migrate         # Run Supabase migrations
```

## Architecture Overview

### Feature-First Structure

All domain logic lives in `src/features/` with feature-specific components, actions, queries, and types:

- `auth/` - Supabase Auth integration, login/signup flows, MFA
- `organizations/` - Multi-tenant org management, invitations, role assignment (Admin/Member)
- `purchase-orders/` - PO CRUD, utilization calculations, filtering, sorting
- `quantity-surveys/` - QS imports, reconciliation, PO linkage
- `imports/` - Excel upload wizard, validation, async processing
- `dashboard/` - KPI cards, charts (Recharts), saved filters
- `alerts/` - Utilization threshold monitoring, email notifications (Resend)
- `settings/` - User profile, org settings, billing placeholders

### Shared Resources

- `src/components/ui/` - Shared primitives (buttons, tables, forms, modals) based on shadcn/ui patterns
- `src/libs/` - Supabase client factories, Excel parsing (xlsx library), formatters, validators, sorting utilities
- `src/types/` - TypeScript interfaces aligned with Supabase generated types (`database.ts`)

### Data Layer

- **Authentication**: Supabase Auth with HTTP-only cookie sessions
- **Database**: PostgreSQL via Supabase with Row Level Security (RLS) enforcing `organization_id` isolation
- **Data Fetching**: Next.js Server Components for initial loads; Server Actions for mutations
- **Organization Context**: Set via cookies/session, consumed through React Context provider

### Key Tables

- `organizations` - Tenant metadata
- `organization_members` - User membership with roles (admin/member)
- `purchase_orders` - PO master records with `order_value`, `total_spent`, `utilization_percent`
- `quantity_surveys` - QS entries linked to POs via `purchase_order_no`
- `alerts` - Utilization alerts (75%, 90%, 100% thresholds)
- `import_jobs` - Track import processing status
- `audit_logs` - Audit trail for critical actions

All tables use `organization_id` for tenant isolation with RLS policies.

## Data Flow Patterns

### Import Pipeline

1. Client uploads Excel → Server Action receives file
2. Parse with `xlsx` library → Validate schema against templates
3. Preview results → User confirms
4. Background processing (batch inserts within transactions) → Update `import_jobs` status
5. Trigger alert evaluation on completion

### Alert Evaluation

1. Recalculate `utilization_percent` from aggregated QS totals
2. Determine threshold transitions (on_track → warning/critical/over_budget)
3. Insert/update `alerts` table
4. Dispatch email via Resend for escalations
5. Log actions to `audit_logs`

## Conventions & Patterns

### Server Actions

- Colocated with features in `actions.ts` files
- Always validate user authentication and organization membership
- Enforce role-based access (admin-only operations check via `organization_members.role`)
- Return structured form state objects with `success`, `error`, and `data` fields

### Queries

- Isolated in `queries.ts` files per feature
- Use Supabase client with RLS automatically enforcing `organization_id`
- Return typed data matching `src/types/database.ts` schema

### Component Patterns

- Server Components by default; add `'use client'` only when needed (forms, interactions, client state)
- Feature components live within their feature directory (e.g., `src/features/dashboard/components/`)
- Shared UI primitives are stateless and live in `src/components/ui/`

### Styling

- Tailwind CSS v4 with utility-first classes
- No CSS modules or styled-components
- Consistent spacing, typography, and color tokens from Tailwind config

### Error Handling

- User-facing errors returned via Server Action form states
- Toast notifications for success/error feedback
- Loading and empty states for all data-driven views

## Testing Strategy

- **Unit Tests**: Business logic (utilization math, validators, formatters) in `__tests__/` or colocated `.test.ts` files
- **Integration Tests**: Server Actions and API routes with mocked Supabase/Resend
- **Coverage Target**: ≥80% on business logic
- **Testing Library**: Vitest + Testing Library + jsdom
- **Definition of Done**: `npm run lint`, `npm run type-check`, and `npm test` all pass

## Environment Variables

Required variables in `.env.local` (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `SUPABASE_PROJECT_REF` - Project reference for CLI commands
- `SUPABASE_DB_URL` - Direct database connection string
- `RESEND_API_KEY` - Email delivery API key

## Security & Access Control

- All tables have RLS policies enforcing `organization_id` filtering
- Middleware (`middleware.ts`) provides coarse auth redirect
- Server Components call `getActiveOrganization()` to enforce fine-grained access
- Admin-only routes (e.g., `/settings/organization`) validate role before rendering
- Never commit secrets; use `.env.local` for development

## Database Workflow

1. Schema changes go in `supabase/migrations/`
2. Run `npm run db:migrate` to apply migrations
3. Run `npm run db:generate-types` to sync TypeScript types
4. Types output to `src/types/database.ts`

## Integration Points

- **Resend**: Email notifications for alerts and invitations (templates in feature directories)
- **Stripe**: Billing integration planned post-MVP (placeholders exist in settings)
- **Vercel**: Hosting, analytics, preview deployments per PR
- **Supabase Storage**: Future attachment uploads (not yet implemented)

## Current Phase

Phase 1 (MVP) is complete. Focus areas:

- Core PO/QS tracking with Excel imports
- Dashboard KPIs and charts
- Alert threshold monitoring
- Multi-tenant organizations with role-based access
- Email notifications

Billing automation (Stripe integration) is deferred post-production.

## Performance Targets

- Dashboard Time to Interactive: <3s
- QS Import Processing: <30s for 200k rows
- Search/Filter Response: <500ms
- Alert Delivery: <5 minutes from threshold breach

## Key Dependencies

- Next.js 15 (App Router, Server Actions, Turbopack)
- React 19
- Supabase JS Client v2
- Tailwind CSS v4
- Recharts (data visualization)
- xlsx (Excel parsing)
- Vitest (testing)
- TypeScript 5
