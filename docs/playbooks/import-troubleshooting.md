# Playbook: Import Troubleshooting

_Last updated: 2024-07-18_

Use this guide when PO or QS Excel imports fail validation or processing.

## Quick Checklist

1. Confirm the file matches the official template (column names, order, types).
2. Check `import_jobs` entry for status and error metadata.
3. Download error report (if generated) for row-level issues.
4. Validate related entities exist (e.g., PO numbers before QS upload).

## Common Validation Errors

| Error                       | Cause                                         | Resolution                                                                         |
| --------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| Missing column              | Header mismatch or typo                       | Redownload template from `/imports`, reapply data.                                 |
| Type mismatch (number/text) | Numeric fields stored as text or with symbols | Clean values in Excel (remove commas, currency symbols).                           |
| Duplicate PO/QS             | Same identifier already imported              | Verify if previous import already captured record; remove duplicates before retry. |
| Unknown purchase_order_no   | QS referencing PO not present                 | Import missing POs first or correct PO number.                                     |
| Date parsing failure        | Non-ISO date formats                          | Convert to `YYYY-MM-DD` before upload.                                             |

## Processing Failures

- **Large file timeout**: Split file into smaller batches; ensure file size < recommended limit (define once benchmarking complete).
- **Background job crash**: Review Supabase Edge Function logs; rerun job after fixing data.
- **Stalled status**: If job stuck in `processing` >30 minutes, check Supabase queue; consider manual resolution and set status to `failed` with notes.

## Support Escalation

- Gather: file version, timestamp, org ID, job ID, screenshots of error.
- Post summary in engineering support channel; attach error report.
- Log issue in ticketing system with label `imports`.

## Prevention Tips

- Share templates with instructions (linked from `/imports`).
- Encourage customers to run local validation (Excel macros or Google Sheets validation) before upload.
- Schedule recurring data hygiene reviews for frequent uploaders.

## References

- Feature brief: `docs/product/feature-briefs/imports.md`
- Data dictionary: `docs/architecture/data-dictionary.md#quantity_surveys`
- Alert pipeline details: `docs/architecture/TECHNICAL_ARCHITECTURE.md` §4.2
