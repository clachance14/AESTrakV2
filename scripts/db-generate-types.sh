#!/usr/bin/env bash
set -euo pipefail

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is not installed. Skipping type generation. See docs/process/supabase-setup.md to enable this command." >&2
  exit 0
fi

PROJECT_REF=${SUPABASE_PROJECT_REF:-}
ACCESS_TOKEN=${SUPABASE_ACCESS_TOKEN:-}
SCHEMA=${SUPABASE_SCHEMA:-public}
OUTPUT_PATH=${SUPABASE_TYPES_OUTPUT_PATH:-src/types/database.ts}

if [[ -z "$PROJECT_REF" && -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_PROJECT_REF or SUPABASE_DB_URL must be set to generate types. Skipping." >&2
  exit 0
fi

if [[ -n "$PROJECT_REF" && -z "$ACCESS_TOKEN" ]]; then
  echo "SUPABASE_ACCESS_TOKEN not set. Obtain a personal access token from Supabase and export it before running." >&2
  exit 1
fi

if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
  supabase gen types typescript \
    --db-url "$SUPABASE_DB_URL" \
    --schema "${SCHEMA}" \
    > "$OUTPUT_PATH"
  exit 0
fi

supabase gen types typescript \
  --project-ref "$PROJECT_REF" \
  --schema "${SCHEMA}" \
  --linked \
  > "$OUTPUT_PATH"
