# Feature Brief: Imports

_Last updated: 2024-07-18_

## Purpose

- Enable admins and members to upload PO/QS Excel files, validate data, preview impact, and process large batches reliably (supports PRD §5.2–5.3 and MVP goals in §2.1).

## User Story Snapshot

- **Primary user**: Admin (initial data load) and Member (ongoing QS updates)
- **Core job**: Ingest Excel data quickly with clear validation feedback.
- **Definition of Done**: User uploads a template-compliant file, sees validation results, confirms import, and tracks job completion all within the 30s performance budget.

## Scope & Key Scenarios

- Upload PO or QS template, validate schema, highlight errors.
- Preview parsed records with spend deltas and impacted POs.
- Confirm import and monitor job status (pending → processing → success/failure).
- Retry failed jobs or download error logs for correction.

## Routes & Components

- Routes: `/imports`, `/imports/upload`, `/imports/preview`, `/imports/status/[jobId]`
- Components: `src/features/imports/*`, shared dropzone/file input in `src/components/ui/`
- States: uploading spinner, validation error list, preview summary, status progress indicators.

## Data & Integrations

- Data: `import_jobs`, `purchase_orders`, `quantity_surveys`; temporary staging buffers.
- Background jobs: Supabase Edge Function handling batch commits, triggers alert evaluation.
- Feature flags: none (core MVP feature for all tiers).

## Analytics & Alerts

- Events: `import.po.uploaded`, `import.qs.uploaded`, `import.job.failed`, `import.job.succeeded`.
- Alerts: post-import trigger recalculates utilization → may generate new alerts (logged via alert pipeline).

## Testing

- Unit tests: validators for required columns, duplicate detection, Excel parsing helpers.
- Integration tests: simulate import workflow with fixture files, ensure job status transitions, verify rollback on failure.
- Fixtures: sample Excel files stored under `tests/fixtures/imports/` (to create) matching templates.

## Open Items / Follow-ups

- Finalize hosting strategy for uploaded files (Supabase Storage vs Next server temp storage).
- Determine max file size and chunking approach for 200k-row imports.
- Define UX copy for validation errors and success toasts.
