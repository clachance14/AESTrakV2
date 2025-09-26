#!/usr/bin/env bash
set -euo pipefail

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is not installed. Skipping migrations. See docs/process/supabase-setup.md to enable this command." >&2
  exit 0
fi

PROJECT_REF=${SUPABASE_PROJECT_REF:-}
ACCESS_TOKEN=${SUPABASE_ACCESS_TOKEN:-}
DB_URL=${SUPABASE_DB_URL:-}

if [[ -n "$DB_URL" ]]; then
  supabase migration up --db-url "$DB_URL"
  exit 0
fi

if [[ -z "$PROJECT_REF" ]]; then
  echo "SUPABASE_DB_URL or SUPABASE_PROJECT_REF must be set to run migrations." >&2
  exit 1
fi

if [[ -z "$ACCESS_TOKEN" ]]; then
  echo "SUPABASE_ACCESS_TOKEN not set. Obtain a personal access token from Supabase and export it before running." >&2
  exit 1
fi

supabase migration up --project-ref "$PROJECT_REF"
