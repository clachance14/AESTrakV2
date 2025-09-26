# Data Dictionary

_Last updated: 2024-07-18_

## Conventions

- **Database**: Supabase PostgreSQL; all tenant-specific records include `organization_id` and are protected by Row Level Security (RLS).
- **Timestamps**: Use `timestamptz` with default `now()`; UI displays in organization time zone (roadmap).
- **Identifiers**: UUID primary keys unless legacy identifiers (e.g., `purchase_order_no`).
- **Audit Columns**: Where relevant, include `created_by`/`updated_by` referencing `auth.users`.
- **Generated Types**: Run `npm run db:generate-types` to sync Supabase types into `src/types/database.ts` after schema changes.

## Core Tables

### organizations

| Column               | Type          | Description                                                                       |
| -------------------- | ------------- | --------------------------------------------------------------------------------- |
| `id`                 | `uuid` (PK)   | Organization identifier (matches Supabase auth group).                            |
| `name`               | `text`        | Display name shown in navigation.                                                 |
| `stripe_customer_id` | `text`        | Placeholder for post-production billing integration (nullable until Stripe live). |
| `plan`               | `text`        | Current subscription tier (`essential` \/ `growth` \/ `enterprise`).              |
| `created_by`         | `uuid`        | Supabase auth user who created the organization.                                  |
| `created_at`         | `timestamptz` | Record creation timestamp.                                                        |
| `updated_at`         | `timestamptz` | Last modification timestamp.                                                      |

- **RLS**: Allow access where user is member of organization (join on `organization_members`). Admins manage plan/billing fields.
- **Indexes**: Primary key on `id`; add index on `plan` for tier reporting.

### organization_members

| Column            | Type                 | Description                                 |
| ----------------- | -------------------- | ------------------------------------------- |
| `user_id`         | `uuid`               | Supabase auth user ID.                      |
| `organization_id` | `uuid`               | Foreign key to `organizations`.             |
| `role`            | `member_role` enum   | `admin` or `member`.                        |
| `status`          | `member_status` enum | `active` or `invited` (pending acceptance). |
| `invited_at`      | `timestamptz`        | Invitation timestamp.                       |
| `joined_at`       | `timestamptz`        | When user accepted invite.                  |

- **Keys**: Composite primary key (`organization_id`, `user_id`).
- **RLS**: Users can read rows where `user_id = auth.uid()` or they are admins of the org. Only admins insert/update roles.
- **Indexes**: Index on `user_id` to speed org switching; partial index on `status = 'invited'` for cleanup jobs.

### user_profiles

| Column         | Type          | Description                  |
| -------------- | ------------- | ---------------------------- |
| `user_id`      | `uuid` (PK)   | Matches Supabase auth user.  |
| `display_name` | `text`        | Preferred name shown in UI.  |
| `phone`        | `text`        | Optional contact for alerts. |
| `mfa_enabled`  | `boolean`     | Tracks whether MFA enforced. |
| `timezone`     | `text`        | Preferred display timezone.  |
| `created_at`   | `timestamptz` | Profile creation timestamp.  |
| `updated_at`   | `timestamptz` | Last update.                 |

- **RLS**: `user_id = auth.uid()` for read/write; admins can read for audit.

### purchase_orders

| Column                  | Type            | Description                                              |
| ----------------------- | --------------- | -------------------------------------------------------- |
| `id`                    | `uuid` (PK)     | Internal identifier (for relationships).                 |
| `organization_id`       | `uuid`          | Tenant scope.                                            |
| `purchase_order_no`     | `text`          | External PO number (unique per org).                     |
| `status`                | `text`          | PO lifecycle status (`open`, `closed`, `on_hold`, etc.). |
| `company`               | `text`          | Client or project company name.                          |
| `order_value`           | `numeric(18,2)` | Authorized PO amount.                                    |
| `total_spent`           | `numeric(18,2)` | Aggregate QS spend linked to this PO.                    |
| `remaining_budget`      | `numeric(18,2)` | Calculated: `order_value - total_spent`.                 |
| `utilization_percent`   | `numeric(5,2)`  | Calculated: `(total_spent / order_value) * 100`.         |
| `order_short_text`      | `text`          | Brief description.                                       |
| `vendor_id`             | `text`          | Vendor identifier.                                       |
| `vendor_short_term`     | `text`          | Vendor name.                                             |
| `work_coordinator_name` | `text`          | Project coordinator.                                     |
| `start_date`            | `date`          | Planned start.                                           |
| `completion_date`       | `date`          | Expected completion.                                     |
| `created_by`            | `uuid`          | User initiating import.                                  |
| `updated_by`            | `uuid`          | Most recent modifier.                                    |
| `created_at`            | `timestamptz`   | Import timestamp.                                        |
| `updated_at`            | `timestamptz`   | Last update.                                             |

- **Constraints**: Unique `(organization_id, purchase_order_no)`; numeric fields default to 0.
- **RLS**: `organization_id` must map to member’s org. Updates allowed for members; schema enforces totals via server functions.
- **Indexes**: Composite `(organization_id, purchase_order_no)`; additional indexes on `(organization_id, vendor_id)` and `(organization_id, utilization_percent)` for dashboard filters.

### quantity_surveys

| Column                       | Type            | Description                                                 |
| ---------------------------- | --------------- | ----------------------------------------------------------- |
| `id`                         | `uuid` (PK)     | Internal identifier.                                        |
| `organization_id`            | `uuid`          | Tenant scope.                                               |
| `purchase_order_id`          | `uuid`          | Reference to `purchase_orders.id` for relational integrity. |
| `purchase_order_no`          | `text`          | Purchase order number for traceability and import matching. |
| `qs_number`                  | `text`          | Unique survey identifier.                                   |
| `total`                      | `numeric(18,2)` | Billing amount for this QS.                                 |
| `quantity_survey_short_text` | `text`          | Description.                                                |
| `contractor_contact`         | `text`          | Contractor or vendor contact.                               |
| `vendor_id`                  | `text`          | Matches vendor on PO.                                       |
| `created_date`               | `date`          | When QS created.                                            |
| `transfer_date`              | `date`          | Submission date.                                            |
| `accepted_date`              | `date`          | Approval date.                                              |
| `invoice_number`             | `text`          | Associated invoice.                                         |
| `invoice_date`               | `date`          | Invoice date.                                               |
| `accounting_document`        | `text`          | ERP reference.                                              |
| `import_job_id`              | `uuid`          | Originating job for traceability.                           |
| `created_at`                 | `timestamptz`   | Insert timestamp.                                           |
| `updated_at`                 | `timestamptz`   | Last update.                                                |

- **Constraints**: Unique `(organization_id, qs_number)`; foreign key ensures matching PO within same org.
- **RLS**: Members can read/write rows for their organization. Inserts only via import pipeline or authorized server action.
- **Indexes**: `(organization_id, purchase_order_no)`; `(organization_id, created_date)` for time-based filters.

### alerts

| Column                | Type                | Description                                       |
| --------------------- | ------------------- | ------------------------------------------------- |
| `id`                  | `uuid` (PK)         | Alert identifier.                                 |
| `organization_id`     | `uuid`              | Tenant scope.                                     |
| `purchase_order_id`   | `uuid`              | FK to `purchase_orders.id`.                       |
| `level`               | `alert_level` enum  | `on_track`, `warning`, `critical`, `over_budget`. |
| `status`              | `alert_status` enum | `active`, `acknowledged`, `resolved`.             |
| `utilization_percent` | `numeric(5,2)`      | Snapshot at time of alert.                        |
| `threshold`           | `numeric(5,2)`      | Threshold breached (75, 90, 100).                 |
| `message`             | `text`              | Human-readable summary.                           |
| `acknowledged_by`     | `uuid`              | User who acknowledged.                            |
| `acknowledged_at`     | `timestamptz`       | Timestamp of acknowledgment.                      |
| `created_at`          | `timestamptz`       | Alert creation time.                              |
| `updated_at`          | `timestamptz`       | Last status change.                               |

- **RLS**: Users view alerts for their org; only admins can change status to resolved.
- **Indexes**: `(organization_id, status)`; `(organization_id, level)` for dashboard counts.

### import_jobs

| Column              | Type                     | Description                                            |
| ------------------- | ------------------------ | ------------------------------------------------------ |
| `id`                | `uuid` (PK)              | Job identifier (mirrors Supabase function invocation). |
| `organization_id`   | `uuid`                   | Tenant scope.                                          |
| `type`              | `import_job_type` enum   | `purchase_orders` or `quantity_surveys`.               |
| `status`            | `import_job_status` enum | `pending`, `processing`, `succeeded`, `failed`.        |
| `file_name`         | `text`                   | Original upload name.                                  |
| `row_count`         | `integer`                | Rows parsed.                                           |
| `error_count`       | `integer`                | Validation failures.                                   |
| `metadata`          | `jsonb`                  | Arbitrary metadata (e.g., summary stats).              |
| `error_report_path` | `text`                   | Storage path for downloadable error log.               |
| `created_by`        | `uuid`                   | User initiating job.                                   |
| `created_at`        | `timestamptz`            | Job creation.                                          |
| `updated_at`        | `timestamptz`            | Last status update.                                    |

- **RLS**: Users see jobs they created or within their organization; only background worker updates status.
- **Indexes**: `(organization_id, created_at desc)` for history view; partial index on `status = 'failed'`.

### audit_logs

| Column            | Type          | Description                                              |
| ----------------- | ------------- | -------------------------------------------------------- |
| `id`              | `uuid` (PK)   | Audit row identifier.                                    |
| `organization_id` | `uuid`        | Tenant scope.                                            |
| `entity_type`     | `text`        | `purchase_order`, `quantity_survey`, `alert`, etc.       |
| `entity_id`       | `uuid`        | Target entity reference.                                 |
| `action`          | `text`        | `created`, `updated`, `acknowledged`, `imported`.        |
| `before`          | `jsonb`       | Snapshot of key fields prior to change (null on create). |
| `after`           | `jsonb`       | Snapshot after change.                                   |
| `acted_by`        | `uuid`        | User performing action.                                  |
| `acted_at`        | `timestamptz` | Timestamp.                                               |
| `context`         | `jsonb`       | Additional metadata (IP, job id).                        |

- **RLS**: Admins access full logs; members can read entries tied to entities they own. No direct writes from clients—only server actions/Edge functions insert rows.

### subscriptions (Post-production)

| Column                   | Type           | Description                       |
| ------------------------ | -------------- | --------------------------------- |
| `organization_id`        | `uuid` (PK/FK) | Links to `organizations`.         |
| `stripe_subscription_id` | `text`         | Stripe subscription reference.    |
| `status`                 | `text`         | `active`, `past_due`, `canceled`. |
| `current_period_end`     | `timestamptz`  | Billing cycle end.                |
| `seats_allocated`        | `integer`      | Seats purchased.                  |
| `seats_used`             | `integer`      | Members currently provisioned.    |
| `metadata`               | `jsonb`        | Additional Stripe payload.        |
| `updated_at`             | `timestamptz`  | Last sync time.                   |

- **Note**: Table may remain empty until Stripe integration launches; include feature flag checks before relying on data.

## Enumerations

| Enum                | Values                                           | Notes                                          |
| ------------------- | ------------------------------------------------ | ---------------------------------------------- |
| `role`              | `admin`, `member`                                | Stored on `organization_members.role`.         |
| `alert_level`       | `on_track`, `warning`, `critical`, `over_budget` | Based on utilization thresholds (75, 90, 100). |
| `alert_status`      | `active`, `acknowledged`, `resolved`             | Drives alert queues.                           |
| `import_job_type`   | `purchase_orders`, `quantity_surveys`            | Distinguishes pipelines.                       |
| `import_job_status` | `pending`, `processing`, `succeeded`, `failed`   | Job lifecycle.                                 |
| `member_role`       | `admin`, `member`                                | Role stored on `organization_members.role`.    |
| `member_status`     | `invited`, `active`                              | Invitation vs active membership state.         |

Maintain enums in migrations; update TypeScript unions in `src/types/` when values change.

## Views & Derived Tables (Roadmap)

- **`purchase_order_utilization_view`**: Pre-aggregated summary for dashboard; consider materialized view refreshed after imports.
- **`alert_activity_view`**: Joins alerts and audit logs to show latest actions.

## References

- PRD: `docs/product/PRD.md`
- Architecture Blueprint: `docs/architecture/TECHNICAL_ARCHITECTURE.md`
- Feature Briefs: `docs/product/feature-briefs/`

Keep this dictionary synchronized with migrations and Supabase schema dumps. When altering tables, update the corresponding section and regenerate types.
