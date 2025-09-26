# AESTrak Documentation Hub

_Last updated: 2024-07-18_

## Overview

This directory is the single source of truth for product, architecture, and process guidance while we build AESTrak v2. Each subfolder owns a specific aspect of the system; keep documents concise, link rather than duplicate content, and update the "Last updated" header whenever changes ship.

## Directory Structure

- `product/` – Business context: PRD, pricing/tiers, roadmap, personas/user goals, feature briefs.
- `architecture/` – Technical design: system overview, ERDs/data dictionary, integration plans, ADRs.
- `process/` – Team workflow: onboarding guide, dev environment setup, testing checklists, backlog tracking, release/rollback runbooks.
- `playbooks/` – Task-specific guides (e.g., Excel import troubleshooting, alert escalation, manual billing until Stripe automation lands).
- `decisions/` – Architectural Decision Records (ADRs) capturing rationale for major choices.
- `release-notes/` – Changelogs tied to deploys or milestone releases.

Existing docs:

- `product/PRD.md` → Product requirements, goals, and MVP scope (migrated from root docs folder).
- `architecture/TECHNICAL_ARCHITECTURE.md` → System architecture blueprint (migrated from root docs folder).
- `architecture/data-dictionary.md` → Table definitions, enums, and RLS notes.
- `architecture/site-map.md` → Route hierarchy, access rules, and page states.
- `product/feature-briefs/` → Collection of feature briefs using `TEMPLATE.md` (currently: `dashboard.md`, `imports.md`, `alerts.md`, `purchase-orders.md`, `quantity-surveys.md`, `settings.md`).
- `process/onboarding.md` → Engineering onboarding steps and tooling expectations.
- `process/supabase-setup.md` → Supabase provisioning, RLS policies, and CLI usage.
- `process/vercel-setup.md` → Deployment configuration and environment variables for Vercel.
- `process/testing-checklist.md` → Pre-release testing checklist.
- `process/backlog.md` → Build task checklist covering roadmap phases and cross-cutting work.

## How to Contribute

1. **Edit in place**: Update the relevant markdown file and adjust "Last updated" meta.
2. **Cross-link**: Reference related docs instead of copy/pasting sections.
3. **Pull requests**: Include doc updates in PRs whenever code or process changes alter behaviour.
4. **Tag owners**: Each doc lists an owner; loop them in for review if ownership shifts.

## Next Docs to Add

- `architecture/erd.excalidraw` – Visual entity relationship diagram to accompany the data dictionary.
- `process/release-runbook.md` – Deployment checklist, rollback steps, and incident contacts.
- `playbooks/alert-escalation.md` – Response plan for critical utilization breaches and customer comms.
- `decisions/ADR-002-charting-library.md` – Document the chosen dashboard charting library and rationale.

Keep this README updated as new documents land or ownership changes.
