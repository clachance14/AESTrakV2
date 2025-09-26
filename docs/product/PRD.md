# AESTrak v2 Product Requirements Document

_Last updated: 2024-07-18_

## Document Control

- **Owner**: Product Management
- **Stakeholders**: Engineering, Design, QA, Revenue Operations, Customer Success
- **Status**: Draft for review
- **Version History**:
  - v0.1 Draft PRD (this document)

## 1. Vision & Strategy Alignment

- **Vision**: Deliver a streamlined SaaS platform that helps construction companies monitor purchase order (PO) spend through quantity survey (QS) imports, surface utilization risks before they become overruns, and support executive decision making with polished dashboards and audit-ready reporting.
- **Target Customers**: Construction firms handling large capital projects that currently reconcile PO spend manually via Excel.
- **Guiding Principles**:
  - Automate the manual reconciliation steps without forcing process change.
  - Provide proactive, trustworthy alerts to prevent budget overruns.
  - Maintain professional, executive-ready presentation of utilization data.
  - Enforce multi-tenant data isolation and compliance from day one.

## 2. Goals & Success Metrics

### 2.1 Business Goals

- Reduce time to identify PO overruns from weeks to <1 day.
- Achieve >95% successful Excel import rate for PO/QS files.
- Maintain user satisfaction score ≥4.5/5 and keep monthly support tickets <5 per organization.
- Reach >80% monthly active usage within target accounts.

### 2.2 User Goals & KPIs

| Role                         | Primary Goals                                                                        | Supporting KPIs                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Admin (also a platform user) | Keep PO budgets on track, invite/manage teammates, and ensure billing stays current. | Alert lead time <24hrs, import success %, active users per org, billing status in good standing |
| Member                       | Monitor PO utilization and upload QS updates quickly without errors.                 | Import success %, time to validation <10 mins, duplicate/error rate, resolved alerts per month  |

### 2.3 Technical KPIs

- Dashboard TTI <3s for typical accounts.
- QS import processing <30s for 200k rows.
- API search/filter latency <500ms under normal load.
- Alert delivery via Resend <5 minutes from threshold breach.
- System uptime >99.5% with monitored error budgets.

## 3. Personas & Context

### 3.1 Construction Team Member (Primary User)

- Responsible for keeping PO spend aligned with budgets across active projects.
- Uploads both PO and QS Excel files, reviews validation feedback, and monitors dashboards daily for risks.
- Needs fast, trustworthy calculations and clear alerts to drive corrective actions.

### 3.2 Account Admin Responsibilities

- Acts as a Construction Team Member with full access plus org-level duties.
- Invites and deactivates users, sets admin/member roles, and manages subscription/billing details.
- Oversees audit logs and ensures utilization data is ready for leadership reviews.

## 4. Product Scope Overview

### 4.1 In-Scope (MVP)

- Supabase Auth with multi-tenant organizations, role management, invitation flow.
- PO ingestion, listing, detail view, filtering, and utilization calculations.
- QS import pipeline with validation, preview, duplicate detection, and rollback on failure.
- Dashboard widgets for utilization summary, risk distribution, and top alerts.
- Alert thresholds (75%, 90%, 100%) with email notifications via Resend.
- Basic exports (Excel) for PO/QS datasets.

### 4.2 Out-of-Scope (for MVP)

- Mobile-native applications (responsive web only).
- AI/ML forecasting of spending trends.
- Custom alert rules per organization (planned for advanced tier).
- Offline data entry.
- Automated Stripe billing integration (planned post-production).

### 4.3 Roadmap Alignment

- Follow the phased roadmap defined in `PROJECT_CONTEXT.md` (Phase 1: Core MVP, Phase 2: Advanced Features, Phase 3: Polish & Optimization). This PRD details functional expectations for Phase 1 with placeholders for Phase 2+ requirements.

## 5. User Journeys & Experience Flows

### 5.1 Onboarding & Organization Setup (Auth + Organizations)

- **Trigger**: New customer signs up via marketing site; receives invite or self-registers.
- **Flow**:
  1. Initial admin registers via Supabase Auth (email/password with optional MFA).
  2. Admin creates or joins an organization and optionally invites additional admins or members.
  3. Team members accept invitations, set passwords, and confirm MFA if enforced.
  4. All users land on the dashboard with a setup checklist (import POs, configure alerts, review sample data).
- **Key Touchpoints**: `src/app/(auth)`, `src/features/auth`, `src/features/organizations`.
- **States**: Empty dashboard, onboarding progress indicator, error handling for invite expiration.

### 5.2 Purchase Order Intake & Configuration

- **Trigger**: Organization imports initial PO dataset.
- **Flow**:
  1. Admin uploads the initial PO Excel using the import workflow (members can upload subsequent updates).
  2. System validates schema (required columns, data types, no duplicates) and previews parsed entries.
  3. User confirms import; POs are stored under the organization scope.
  4. Admin configures optional metadata (tags, alert recipients).
- **Touchpoints**: `src/features/purchase-orders`, `src/features/imports`.
- **States**: Loading, validation errors (highlight columns), success toasts, rollback messaging.

### 5.3 Quantity Survey Import & Reconciliation

- **Trigger**: Team receives updated QS workbook.
- **Flow**:
  1. Member uploads QS Excel via the import wizard.
  2. Application validates required fields, matches POs, detects duplicates, and calculates total spend deltas.
  3. Preview summarizes impact on utilization per PO.
  4. Member confirms import; system updates utilization and generates alerts if thresholds are breached.
- **Touchpoints**: `src/features/quantity-surveys`, `src/features/imports`, background processing worker.
- **States**: Async processing indicator (<30s target), validation errors, delta summary, success confirmation.

### 5.4 Monitoring & Alert Response

- **Trigger**: Utilization crosses defined thresholds.
- **Flow**:
  1. Dashboard surfaces updated utilization metrics (cards + charts).
  2. Alerts list prioritizes critical and over-budget items; filters available by project, vendor, threshold.
  3. Email notifications dispatched via Resend with contextual data and next steps.
  4. Member or admin updates PO status or acknowledges the alert; system logs the action.
- **Touchpoints**: `src/features/dashboard`, `src/features/alerts`, Resend integration.
- **States**: Alert banners, acknowledgment workflow, audit log entries, escalations.

### 5.5 Reporting & Leadership Visibility

- **Trigger**: Admin needs to share utilization summaries or audit documentation with leadership.
- **Flow**:
  1. Admin generates an export (Excel at MVP, PDF roadmap) with utilization summaries and trend charts.
  2. System enforces that members can view/download exports while only admins manage billing and user invitations.
  3. Future scheduled report automation remains a Phase 2 consideration.
- **Touchpoints**: `src/features/dashboard`, `src/features/purchase-orders`, export utilities in `src/libs`.
- **States**: Export progress indicator, download confirmation, error retries.

## 6. Pricing & Tiering Strategy

| Tier       | Target Customer                                           | Monthly Price (placeholder) | Feature Entitlements                                                                                                      |
| ---------- | --------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Essential  | Single-project teams needing automated reconciliation     | $X/month                    | Core dashboard, PO/QS imports, standard alerts, Excel export, up to 3 users                                               |
| Growth     | Multi-project organizations with collaborative workflows  | $Y/month                    | Everything in Essential + advanced analytics widgets, configurable alert recipients, scheduled exports, 10 users included |
| Enterprise | Large enterprises with compliance and customization needs | $Z/month                    | Everything in Growth + custom RLS policies, SSO, audit trail exports, priority support, dedicated onboarding              |

- **Billing Model**: Seat-based with usage add-ons for additional imports beyond baseline.
- **Upgrade/Downgrade Rules**: Immediate feature gating/unlocking; pro-rated billing via Stripe.
- **Entitlement Enforcement**: Feature flags in `src/features` backed by Supabase metadata; ensure UI gating matches RLS.

## 7. Functional Requirements by Domain

### 7.1 Authentication & Organizations (`src/features/auth`, `src/features/organizations`)

- Supabase Auth integration with email/password (SSO roadmap).
- Organization creation, invitations, and role assignment limited to Admin and Member.
- MFA recommended (TotP or email OTP) and enforced for Admins in Enterprise tier.
- Middleware guarding App Router segments; redirect unauthenticated users to login.
- Audit trail of user invites, role changes, and sign-ins.

### 7.2 Purchase Orders (`src/features/purchase-orders`)

- CRUD operations scoped by `organization_id` with RLS enforcement.
- List view with filtering (status, vendor, coordinator, utilization range), sorting, pagination (cursor-based).
- Detail view showing utilization calculations, linked QS entries, alert history, attachments (roadmap).
- Bulk assignment actions (Phase 2).
- Data validations: `order_value > 0`, unique `purchase_order_no` per organization.

### 7.3 Quantity Surveys (`src/features/quantity-surveys`)

- QS record listing with filters (PO, vendor, date range, invoice status).
- Detail views linking back to POs.
- Inline indicators for QS entries contributing to active alerts.
- Validation of required fields and date formats (ISO strings).

### 7.4 Imports (`src/features/imports`)

- Upload wizard supporting Excel (.xlsx) per provided templates.
- Schema validation with actionable error messages (column missing, type mismatch, duplicate rows).
- Preview step summarizing key metrics (PO count affected, total spend delta, new alerts triggered).
- Background job execution (Supabase Function or server action) with status tracking and retry.
- Logs accessible to Admins for audit and troubleshooting.

### 7.5 Dashboard & Analytics (`src/features/dashboard`)

- Overview cards (Total POs, Total Spend, Remaining Budget, Average Utilization).
- Charts (risk distribution, trend over time, top vendors by spend).
- Configurable filters (organization, project, time period).
- Loading, empty, and error states per repo standards.
- Performance budget: <3s load with cached queries.

### 7.6 Alerts & Notifications (`src/features/alerts`)

- Alert level logic based on utilization thresholds (on_track, warning, critical, over_budget).
- Alert list with sorting, filtering, acknowledgment workflow, and action history.
- Email notifications via Resend with deep links to PO detail.
- Future SMS notifications flagged as Phase 2+ enhancements.
- Supabase background job schedules to evaluate thresholds post-import.

### 7.7 Billing & Subscription Management (Post-production)

- MVP ships without automated billing; admins manage subscriptions manually off-platform.
- Prepare data model hooks (`subscriptions` table, admin-only billing screen placeholder) to enable Stripe integration after launch.
- Post-production targets: map tiers to Stripe products, sync subscription status via webhooks, enforce seat limits, and handle payment failure grace periods.

### 7.8 Reporting & Exports (`src/features/dashboard`, `src/libs`)

- Excel exports of PO/QS lists with current filters applied (MVP).
- Audit log export (Enterprise tier, Phase 2).
- PDF report templates for executive summaries (Phase 2).
- Ensure exports respect RLS and user roles.

## 8. Data Model & Integrations

- **Entities**: PurchaseOrder, QuantitySurvey, Organization, UserProfile, Alert, Subscription, ImportJob, AuditLog.
- Maintain TypeScript interfaces in `src/types/` aligned with Supabase generated types.
- Database migration strategy via Supabase CLI; enforce RLS (no table ships without policies).
- Index recommendations: `purchase_orders (purchase_order_no, organization_id)`, `quantity_surveys (purchase_order_no, created_date)`, `alerts (organization_id, status)`.
- Excel parsing via Node equivalents (e.g., `xlsx` library) with consistent validation logic shared between PO and QS imports.
- External services: Stripe, Resend, Vercel Analytics; document API contracts and failure handling.

## 9. Non-Functional Requirements

### 9.1 Performance

- Import pipeline must handle 200k QS rows <30s via streamed processing and batching.
- Dashboard queries optimized via supabase views/materialized aggregates where needed.
- Search/filter interactions <500ms response for typical datasets.

### 9.2 Security & Compliance

- Enforce RLS for all organization-scoped tables; cover via automated tests.
- Secure handling of secrets in `.env.local`; update `.env.example` for new variables.
- MFA and password policies aligned with enterprise expectations.
- Audit logging for key events (imports, alert acknowledgments, billing changes).

### 9.3 Reliability & Operations

- Deployments via Vercel with rollback plan; Supabase branch workflow for migrations.
- Monitoring: Error tracking (Sentry or equivalent), performance dashboards, import job telemetry.
- Incident response playbook with SLA targets (ack <1hr, resolve <24hr for P1).

### 9.4 Accessibility & UX

- WCAG AA compliance for core workflows.
- Keyboard navigable import wizard, dashboard filters, and tables.
- Toasts and alerts announced to assistive technologies.

## 10. Analytics & Telemetry

- Event taxonomy (to be captured in `src/libs/analytics`): `auth.sign_in`, `organization.created`, `import.po.uploaded`, `import.qs.failed`, `dashboard.viewed`, `alert.acknowledged`, `subscription.upgraded`.
- Define payload schema (user id, org id, metadata) and retention policy.
- Dashboards for tracking KPIs (Amplitude or Supabase analytics).

## 11. Testing & Quality Strategy

- Adopt TDD: write Vitest specs first for business logic modules (utilization calc, alert thresholds, import validators).
- Unit tests in `src/features/**/__tests__` or colocated `*.test.ts(x)` where clarity improves.
- Integration tests for API routes and Supabase functions; mock Stripe/Resend.
- Performance testing of import pipeline with representative datasets.
- Definition of Done includes passing `npm run lint`, `npm run type-check`, `npm run test`, coverage ≥80% on business logic files.

## 12. Documentation & Enablement

- Maintain `PROJECT_CONTEXT.md` as living overview; link to this PRD.
- Create `/docs` subpages for onboarding checklist, API reference (OpenAPI), data dictionary, and runbooks.
- Provide internal training material (videos or walkthrough decks) once MVP stabilizes.

## 13. Risks & Mitigations

- **Large Excel imports exceed processing window** → Stream processing, chunked transactions, background job with progress updates.
- **Inconsistent source data quality** → Strict validation, template distribution, detailed error feedback, sample datasets for clients.
- **Alert fatigue** → Provide filter controls, grouping, and future configurable thresholds.
- **Stripe/RLS misconfiguration** → Automated tests for entitlements, runbook for manual overrides, staging validation before release.
- **Adoption lag** → Onboarding checklist, in-app guidance, customer success follow-ups.

## 14. Assumptions

- Customers can provide PO and QS data in consistent Excel templates.
- Organizations have at least one admin capable of managing invites and billing.
- Email delivery via Resend meets customer IT policies (whitelisting manageable).
- Stripe is acceptable payment processor for target customers.

## 15. Decisions & Clarifications

- **SSO scope**: Reserve SAML/OIDC SSO for the Enterprise tier; MVP supports email/password with optional MFA, keeping roadmap hooks for future rollout.
- **Scheduled report cadence**: Exclude scheduled reports from MVP; focus on in-app dashboards and revisit automated summaries post-launch.
- **Alert thresholds**: Launch with standardized utilization levels at 75%, 90%, and 100%; defer per-customer rules and extra thresholds to Phase 2.
- **Audit logging depth**: Capture metadata plus before/after values for critical financial fields (order_value, total_spent, utilization_percent) and link entries to the acting user/time; full row snapshots are not required initially.
- **Dashboard personalization**: Provide a single configurable dashboard with saved filters covering all roles; evaluate role-specific variants after MVP adoption review.
- **Service commitments**: Operate against internal performance targets without contractual SLAs for launch; revisit formal SLAs before enterprise agreements.
- **Billing automation**: Defer Stripe integration until post-production; MVP provides manual subscription handling with UI placeholders.

## 16. Sign-off Checklist

- [ ] Product owner review (you).
