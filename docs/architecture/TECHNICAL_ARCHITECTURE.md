# AESTrak v2 Technical Architecture Overview

_Last updated: 2024-07-18_

## Document Control

- **Owner**: Engineering
- **Stakeholders**: Product, Design, QA, DevOps, Security
- **Status**: Draft for review
- **Related Docs**: `PROJECT_CONTEXT.md`, `docs/PRD.md`

## 1. Purpose & Scope

- Provide an engineering blueprint that links the PRD's user journeys to concrete application, data, and infrastructure components.
- Define module boundaries, shared services, and integration contracts before implementation.
- Establish non-functional guardrails (performance, security, reliability) and operational responsibilities.

## 2. System Overview

- **Client**: Next.js 15 App Router (React Server Components + Client Components where needed), Tailwind, shadcn/ui.
- **Server**: Next.js server actions/route handlers, Supabase PostgREST APIs, Supabase Edge Functions for long-running tasks.
- **Data**: Supabase PostgreSQL with Row Level Security enforced per `organization_id`.
- **Background Processing**: Supabase Edge Functions or cron jobs for import processing and alert evaluation.
- **Integrations**: Stripe for billing (post-production rollout), Resend for email, Vercel for hosting/analytics.

## 3. Application Architecture

### 3.1 App Router Map (High-Level)

```
src/app/
├── (marketing)/*                      # Public marketing pages (future)
├── (auth)/login, signup, invite       # Authentication flow
├── (app)/
│   ├── layout.tsx                     # Authenticated shell (nav, org switcher)
│   ├── dashboard/                     # Default landing view
│   ├── purchase-orders/               # PO list + details
│   ├── quantity-surveys/              # QS list + details
│   ├── imports/                       # Import wizard
│   ├── alerts/                        # Alert list + detail
│   ├── settings/
│   │   ├── organization/              # Org settings, roles
│   │   └── billing/                   # Billing settings (post-production Stripe portal)
│   └── api/                           # Route handlers (if using Next APIs)
└── middleware.ts                      # Auth/org guard
```

- Shared layout handles auth check, organization context provider, global toasts.
- Route groups may be used for role gating (`(admin)`, `(controller)`), but MVP leverages runtime guards/higher-order components.
- Current implementation (Phase 1) uses `middleware.ts` for coarse auth redirect logic and server components (`getActiveOrganization`) to enforce admin-only routes like `/settings/organization`.

### 3.2 Feature Module Boundaries

- `src/features/auth`: Auth UI components, Supabase client helpers, MFA prompts.
- `src/features/organizations`: Org selector, invitation flows, role management, context providers.
- `src/features/purchase-orders`: PO table, detail view, utilization calculators, filters.
- `src/features/quantity-surveys`: QS tables, detail modals, reconciliation helpers.
- `src/features/imports`: Multi-step import wizard, validation hooks, progress indicators.
- `src/features/dashboard`: KPI cards, charts, saved filter logic.
- `src/features/alerts`: Alert list, acknowledgment, email templates (React Email) and Resend dispatchers.
- `src/features/settings`: Profile form, billing placeholder, shared settings navigation components.
- `src/features/billing` (nested under auth/settings): Placeholder screens for future Stripe checkout, customer portal, and seat management.
- `src/components/ui`: Shared primitives (buttons, tables, form inputs, modals) consistent with shadcn/ui.
- `src/libs`: Supabase client factory, analytics wrapper, Excel parsing utilities, date/number helpers, feature flag toggles.
- `src/types`: Shared TypeScript types matching Supabase schema and Stripe payloads.

### 3.3 State Management & Data Fetching

- Rely on Next.js Server Components for data fetching where possible; client components use React Query or SWR for real-time updates (optional for MVP).
- Server actions handle mutations that require Supabase interaction with logged-in user context.
- Supabase client instantiation centralised in `src/libs/supabaseServerClient.ts` and `supabaseBrowserClient.ts`.
- Organization context set via cookies/session and provided through React Context provider for client modules.

## 4. Data Architecture

### 4.1 Core Tables (Supabase)

| Table                  | Purpose                | Key Fields                                                                                  | RLS Strategy                                           |
| ---------------------- | ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `organizations`        | Tenant metadata        | `id`, `name`, `stripe_customer_id`                                                          | Allow role-based access for members                    |
| `organization_members` | User membership/roles  | `user_id`, `organization_id`, `role`                                                        | Users access rows where `user_id = auth.uid()`         |
| `purchase_orders`      | PO master records      | `purchase_order_no`, `order_value`, `total_spent`, `utilization_percent`, `organization_id` | Restrict by `organization_id = org_id_from_membership` |
| `quantity_surveys`     | QS entries tied to POs | `qs_number`, `purchase_order_no`, `total`, `created_date`, `organization_id`                | Restrict by `organization_id`                          |
| `alerts`               | Utilization alerts     | `id`, `purchase_order_no`, `level`, `status`, `acknowledged_by`                             | Restrict by `organization_id`                          |
| `import_jobs`          | Track import state     | `id`, `type`, `status`, `metadata`, `created_by`, `organization_id`                         | Restrict by `organization_id`                          |
| `audit_logs`           | Audit trail            | `entity_type`, `entity_id`, `action`, `before`, `after`, `acted_by`                         | Restrict by `organization_id`                          |
| `subscriptions`        | Stripe sync data       | `organization_id`, `stripe_subscription_id`, `plan`, `status`                               | Restrict by `organization_id`                          |

- Use Supabase generated types (`npm run db:generate-types`) to keep `src/types/database.ts` in sync.
- Index recommendations: composite indexes on `(organization_id, purchase_order_no)` for POs and QS; `(organization_id, level, status)` for alerts.

### 4.2 Data Flows

- **Import Pipeline**:
  1. Client uploads Excel → temporary storage (Supabase Storage or direct to Next server).
  2. Server parses file using `xlsx`/`exceljs` library; validates schema against templates.
  3. Valid rows staged in memory or temp tables; summary preview returned.
  4. User confirms → Supabase Edge Function processes in batches, updating `purchase_orders` and `quantity_surveys` within transaction boundaries.
  5. Import job status updates (`pending → processing → succeeded/failed`) stored in `import_jobs`.
  6. On completion, triggers alert evaluation function.
- **Alert Evaluation**:
  1. Edge Function or scheduled job recalculates `utilization_percent` via aggregated QS totals.
  2. Determines alert level transitions (on_track → warning/critical/over_budget).
  3. Inserts/updates `alerts` table and dispatches email via Resend if level escalates.
  4. Logs actions in `audit_logs`.
- **Billing Sync** (Post-production):
  - Future webhook handler (Next.js route handler or Supabase Function) will ingest Stripe events, update `subscriptions`, and adjust feature flags/limits per organization once billing automation goes live.

## 5. Integration Contracts

### 5.1 Stripe (Post-production Plan)

- MVP deploys without live Stripe automation; provision placeholders (billing settings route, `subscriptions` table) for future integration.
- Post-production tasks: map tiers to Stripe products/prices, implement webhooks (`checkout.session.completed`, `customer.subscription.updated`, `invoice.payment_failed`, `customer.subscription.deleted`), and expose secure customer portal links.
- Ensure webhook endpoint (`src/app/api/stripe/webhook/route.ts`) is scaffolded but feature-flagged until launch readiness.

### 5.2 Resend (Email)

- Use React Email templates stored in `src/features/alerts/email`.
- Emails triggered from alert evaluation function and onboarding (invites).
- Store delivery metadata (message id, timestamp) in `alerts` or dedicated `email_events` table for troubleshooting.

### 5.3 Analytics & Telemetry

- Abstract analytics calls in `src/libs/analytics.ts`; initial implementation logs to console or Supabase until Amplitude/Segment integration selected.
- Capture events listed in PRD section 10 with context (user id, org id, metadata).

## 6. Security & Access Control

- Supabase RLS policies applied to every tenant-scoped table before release; tests ensure unauthorized access is blocked.
- Auth flow uses Supabase Auth JS; tokens stored in HTTP-only cookies.
- MFA optional at MVP but recommended for Admins; design API to accept MFA tokens when available.
- Server actions validate role/entitlement prior to executing mutations (e.g., only admins can approve imports).
- Audit logging: record actor, timestamp, origin IP (if available), before/after for key fields (PO totals, utilization, alert status).

## 7. Performance & Scalability Considerations

- Imports processed in batches (e.g., 5k rows per transaction) to keep within 30s goal; adjust based on Supabase function limits.
- Utilize materialized views or cached aggregates for dashboard metrics to keep TTI <3s.
- Apply pagination and server-side filters to tables by default to avoid rendering >100 rows at once.
- Enable Supabase connection pooling (PgBouncer) and plan for read replicas (Phase 2+ if needed).

## 8. Reliability & Operations

- Deploy via Vercel preview environments per PR branch; production deploy requires passing tests.
- Supabase branch workflow mirrors Git branches; migrations run via `npm run db:migrate` in CI before deploy.
- Monitoring stack: Vercel Analytics for web metrics, Supabase logs for DB errors, integrate Sentry (roadmap) for client/server exceptions.
- Alerting: Ops notified via email when import jobs fail or alert dispatch errors occur.
- Backup/restore: rely on Supabase automated backups; document manual restore procedure in runbook.

## 9. Environment & Configuration

- Secrets managed via Vercel environment variables and Supabase config; developers store local secrets in `.env.local` and update `.env.example` as needed.
- Required env vars (initial list): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` (if used).
- Post-production additions: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and related billing config once integration activates.
- Feature flags stored in `environment.ts` or Supabase `feature_flags` table for tier-based gating.

## 10. Component & Module Communications

- Use TypeScript interfaces/enums in `src/types/` to share contracts (e.g., `PurchaseOrder`, `AlertLevel`).
- Shared services in `src/libs/` expose pure functions for utilization math, alert logic, and import validation to keep consistency between UI and background jobs.
- Excel templates shipped in `public/templates/`; import wizard validates file headers against these.

## 11. Future Considerations

- Evaluate real-time subscriptions via Supabase Realtime for live dashboard updates post-MVP.
- Plan for multi-region support if compliance requires (data residency per customer).
- Investigate optional SMS notifications and rule engine for custom thresholds once core email alerts are stable.
- Consider data warehouse export (Snowflake/BigQuery) for enterprise analytics.

## 12. Open Items

- Confirm hosting strategy for large Excel files (Supabase Storage vs temporary Next server storage).
- Decide on visualization library (e.g., Recharts, Chart.js) and performance profiling approach.
- Align on background job framework (Supabase Edge Functions vs external worker) based on import throughput tests.
- Validate integration test coverage requirements (CI parallelization, test data seeding).

## 13. Approval

- [ ] Engineering lead
- [ ] Product owner
- [ ] Security/Compliance (if required)
