# Application Site Map

_Last updated: 2024-07-18_

This sitemap reflects the routes defined in the PRD (see §5) and the technical architecture document. It covers public entry points, authenticated sections, role visibility, and notable UI states for each page.

## Legend

- **Auth**: `Public` (no auth) or `Authenticated`
- **Access**: `Admin`, `Member`, or `Admin-only`
- **States**: Key empty/loading/error states the page must handle

## Route Tree

```
/ (marketing placeholder)
├─ /login                    [Public]  → Sign-in form with MFA prompt
├─ /signup                   [Public]  → Initial admin registration
├─ /invite/[token]           [Public]  → Invitation acceptance flow
└─ /(app)                    [Authenticated Shell]
   ├─ layout                 → Navigation, org switcher, toasts
   ├─ /dashboard             [Admin + Member]
   ├─ /purchase-orders       [Admin + Member]
   │  └─ /purchase-orders/[poId]
   ├─ /quantity-surveys      [Admin + Member]
   │  └─ /quantity-surveys/[qsId]
   ├─ /imports               [Admin + Member]
   │  ├─ /imports/upload
   │  ├─ /imports/preview
   │  └─ /imports/status/[jobId]
   ├─ /alerts                [Admin + Member]
   │  └─ /alerts/[alertId]
   └─ /settings              [Authenticated]
      ├─ /settings/profile   [Admin + Member]
      ├─ /settings/organization [Admin-only]
      └─ /settings/billing   [Admin-only] (post-production Stripe portal)
```

## Page Details

### `/login`

- **Auth**: Public
- **Purpose**: Email/password login, MFA prompt if enabled.
- **States**: Form validation errors, locked account messaging.

### `/signup`

- **Auth**: Public
- **Purpose**: Onboard the first admin; capture organization name.
- **States**: Duplicate org validation, success redirect.

### `/invite/[token]`

- **Auth**: Public (token verified)
- **Purpose**: Accept invitation, set password, optional MFA setup.
- **States**: Expired token, invalid token, success confirmation.

### `/(app)/layout`

- **Auth**: Authenticated
- **Purpose**: Shared shell with navigation, org switcher, global toasts, feature flag guards.
- **States**: Loading indicator while fetching session/org context.

### `/dashboard`

- **Auth**: Authenticated (Admin + Member)
- **Purpose**: KPI cards, risk distribution chart, alert snapshot.
- **States**: Loading skeleton, empty prompts (“Import data to get started”), error banner with retry.
- **Links**: Feature brief `product/feature-briefs/dashboard.md`.

### `/purchase-orders`

- **Auth**: Authenticated (Admin + Member)
- **Purpose**: Searchable/filterable list of POs with utilization indicators.
- **States**: Empty (no POs yet), loading table skeleton, error fallback.
- **Child**: `/purchase-orders/[poId]` → PO details, linked QS entries, alert history.

### `/quantity-surveys`

- **Auth**: Authenticated (Admin + Member)
- **Purpose**: List QS records, filter by PO/vendor/date.
- **States**: Empty (prompt to import), loading, error.
- **Child**: `/quantity-surveys/[qsId]` → QS detail page with origin import.

### `/imports`

- **Auth**: Authenticated (Admin + Member)
- **Purpose**: Import job history, template downloads.
- **States**: Empty (no jobs yet), history list, error fetching job list.
- **Children**:
  - `/imports/upload` → Upload step (drag/drop, template link).
  - `/imports/preview` → Parsed summary, validation errors, confirm actions.
  - `/imports/status/[jobId]` → Progress display, error logs, retry control.
- **Links**: `product/feature-briefs/imports.md`.

### `/alerts`

- **Auth**: Authenticated (Admin + Member)
- **Purpose**: Alert queue with filters, acknowledgment workflow.
- **States**: Empty (no active alerts), loading spinner, error state.
- **Child**: `/alerts/[alertId]` → Detailed alert timeline, audit log entries, email history.

### `/settings/profile`

- **Auth**: Authenticated (Admin + Member)
- **Purpose**: Update display name, optional phone, and timezone preferences.
- **States**: Form validation errors, update confirmation, session expiry redirect.

### `/settings/organization`

- **Auth**: Authenticated (Admin-only)
- **Purpose**: Manage users (invite, deactivate), view audit entries.
- **States**: Invite form validation, empty user list (beyond admin), error fetching members.

### `/settings/billing`

- **Auth**: Authenticated (Admin-only)
- **Purpose**: Manual billing placeholders (pre-Stripe); future Stripe portal link.
- **States**: “Coming soon” messaging, instructions for manual billing, error if feature flag disabled.

### API & Background Endpoints (supporting routes)

- `/api/stripe/webhook` → Disabled until post-production; scaffold for future Stripe events.
- `/api/imports/status` (optional) → Polling endpoint for import job status.

## References

- PRD journeys: `docs/product/PRD.md` §5
- Architecture routing map: `docs/architecture/TECHNICAL_ARCHITECTURE.md`
- Feature briefs: `docs/product/feature-briefs/`

Keep this sitemap updated as new routes or role gates are introduced. Update feature briefs and architecture docs simultaneously to ensure consistency.
