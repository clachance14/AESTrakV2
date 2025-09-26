# Build Backlog & Task Checklist

_Last updated: 2024-07-18_

This backlog captures the major tasks required to deliver AESTrak v2 from MVP through post-production follow-ups. Grouped by roadmap phase and cross-cutting workstreams. Reference product and architecture docs for detailed requirements.

Legend: `[ ]` open, `[x]` complete. Update entries as work progresses.

## Phase 0 – Foundation & Tooling

- [x] Establish Supabase project and confirm RLS defaults (`docs/architecture/data-dictionary.md`, `docs/process/supabase-setup.md`).
- [ ] Configure Vercel project + environment variables baseline (`docs/process/vercel-setup.md`). _(deferred)_
- [x] Implement Supabase type generation pipeline in CI (`package.json` scripts).
- [x] Set up automated lint/test workflows in CI.
- [ ] Author ERD diagram (`architecture/erd.excalidraw`). _(deferred – reference Supabase schema for now)_

## Phase 1 – Core MVP (Weeks 1–4)

### Authentication & Organizations

- [ ] Build login/signup/invite routes with Supabase Auth (`product/feature-briefs/settings.md`).
- [ ] Implement organization membership management (admin/member roles).
- [ ] Enforce middleware for authenticated routes (`architecture/site-map.md`).
- [ ] Create audit logging for invites and role changes (`data-dictionary` → `audit_logs`).

### Purchase Orders

- [ ] Implement PO list with filters/sorting/pagination (`feature-briefs/purchase-orders.md`).
- [ ] Build PO detail page with QS + alert linkage.
- [ ] Add Excel export for filtered POs (MVP scope).

### Quantity Surveys

- [ ] Build QS list view with filters (`feature-briefs/quantity-surveys.md`).
- [ ] Implement QS detail view with import provenance.
- [ ] Surface validation flags from import pipeline.

### Imports

- [ ] Create upload wizard (PO/QS) with template download, validation (`feature-briefs/imports.md`).
- [ ] Implement server-side parsing + staging logic.
- [ ] Build import preview summary and confirmation step.
- [ ] Implement import job status tracking UI.
- [ ] Deploy Supabase Edge Function (or server action) for batch processing.

### Dashboard & Alerts

- [ ] Deliver dashboard cards, charts, filter panel (`feature-briefs/dashboard.md`).
- [ ] Link dashboard alerts snapshot to `/alerts` route.
- [ ] Build alert list with filters + acknowledgment flow (`feature-briefs/alerts.md`).
- [ ] Implement alert detail page with audit timeline.
- [ ] Configure Resend email templates for alert notifications.

### Reporting & Exports

- [ ] Implement PO/QS Excel export endpoints (shared utility in `src/libs`).
- [ ] Provide download links and success/error messaging in UI.

### Settings

- [ ] Build profile settings page (display name, MFA toggle placeholders).
- [ ] Build organization settings (invite, role change, deactivate) (`feature-briefs/settings.md`).
- [ ] Show billing placeholder messaging with manual instructions.

### Quality & Ops

- [ ] Seed representative PO/QS datasets for development/testing.
- [ ] Write unit/integration tests per feature briefs.
- [ ] Validate performance target: 200k-row import <30s (benchmark script).

## Phase 2 – Advanced Features (Weeks 5–8)

- [ ] Implement advanced dashboard analytics (trend charts, vendor rankings).
- [ ] Add alert escalations + configurable recipients (within email channel).
- [ ] Build export/report enhancements (scheduled exports removed; consider monthly download flow).
- [ ] Implement audit log export (Enterprise tier).
- [ ] Evaluate and implement optional SMS alert notifications (feature flagged).

## Phase 3 – Polish & Optimization (Weeks 9–12)

- [ ] Optimize large dataset handling (pagination + caching).
- [ ] Improve UI (advanced filters, bulk operations, responsiveness).
- [ ] Conduct performance profiling (Next.js + Supabase queries).
- [ ] Harden monitoring/telemetry (error tracking integration).
- [ ] Prepare deployment playbooks (`process/release-runbook.md`).

## Post-Production Follow-ups

- [ ] Implement Stripe billing automation (per `decisions/ADR-001-billing-strategy.md`).
  - [ ] Map tiers to Stripe products/prices.
  - [ ] Implement webhook handlers & feature flag enforcement.
  - [ ] Enable customer portal and billing UI toggle.
- [ ] Introduce SMS alert channel (if validated in Phase 2).
- [ ] Reassess manual billing playbook; retire once automation live.
- [ ] Add MDR/analytics exports once data warehouse decision made.

## Cross-Cutting Documentation & Operations

- [ ] Maintain feature briefs as features evolve (dashboard/imports/alerts/etc.).
- [ ] Update data dictionary with each migration (column/type/index changes).
- [ ] Keep sitemap synced with new routes or access changes.
- [ ] Write release notes per deployment (`release-notes/` template).
- [ ] Draft alert escalation playbook (`playbooks/alert-escalation.md`).
- [ ] Finalize release runbook (`process/release-runbook.md`).

## Testing & Verification To-Dos

- [ ] Automate Vitest coverage gating in CI (`>=80%`).
- [ ] Create integration test harness for Supabase functions/import pipeline.
- [ ] Implement load test for import endpoints.
- [ ] Document manual QA scenarios in testing checklist as they evolve.

## Customer Success & Support Readiness

- [ ] Prepare onboarding checklist for customers (outside scope but note here).
- [ ] Create quick-start video/guide once MVP stable.
- [ ] Define support contact process (email/phone) and escalation matrix.

Update this checklist during planning sessions and link issues/epics to each bullet for tracking.
