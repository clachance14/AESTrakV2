# Comengy Automation - Implementation Plan

## Overview

Automated system to download Excel files from Comengy portal daily and import into AESTrak database.

## Architecture

```
┌─────────────────────────────────────────────┐
│  GitHub Actions (Daily Cron - 2 AM)       │
│  ┌─────────────────────────────────────┐   │
│  │ 1. Run Puppeteer Script             │   │
│  │ 2. Download PO & QS Excel Files     │   │
│  │ 3. Upload to Supabase Storage       │   │
│  │ 4. Trigger Vercel API Endpoint      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↓
                    ↓ (Files in Supabase Storage)
                    ↓ (API POST /api/import-comengy)
                    ↓
┌─────────────────────────────────────────────┐
│  Vercel (Next.js App)                      │
│  ┌─────────────────────────────────────┐   │
│  │ API: /api/import-comengy            │   │
│  │ 1. Fetch files from Storage         │   │
│  │ 2. Parse Excel (existing logic)     │   │
│  │ 3. Update database                  │   │
│  │ 4. Send notifications               │   │
│  │ 5. Return success/failure           │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Phase 1: Excel Download (CURRENT PRIORITY)

### Status: IN PROGRESS

**Goal**: Get Puppeteer script to successfully download Excel files

### Current Issues:

1. ❌ Downloads not completing in WSL/Linux environment
2. ❌ Browser rendering issues (transparent window)
3. ❌ Files not appearing in download directory

### Debugging Steps:

- [x] Add download directory configuration (CDP)
- [x] Add DISPLAY=:100 for Xvfb
- [x] Increase wait times (15 seconds)
- [x] Add file listing debug output
- [ ] **Add screenshots of right-click menus**
- [ ] **Verify VNC clicks are working**
- [ ] **Test download in proper Linux environment (not WSL)**

### Next Actions:

1. **Capture screenshots** during automation to see:
   - Does the right-click menu appear?
   - Is the "Excel export" option visible?
   - Are we clicking the right coordinates?

2. **Test alternatives**:
   - Option A: Run script natively on Windows (where Claude Browser testing worked)
   - Option B: Run in Docker container with proper X11
   - Option C: Use GitHub Actions environment (Ubuntu with GUI support)

3. **Once downloads work**: Move to Phase 2

### Success Criteria:

- ✅ Script downloads PO Excel file to filesystem
- ✅ Script downloads QS Excel file to filesystem
- ✅ Files have correct naming pattern: `DOWREAD-ICS.orders.*.xlsx` and `DOWREAD-ICS.QS.*.xlsx`
- ✅ Can run reliably without manual intervention

---

## Phase 2: File Storage Integration

### Status: NOT STARTED

**Goal**: Upload downloaded files to Supabase Storage

### Tasks:

1. **Create Supabase Storage bucket**
   - Name: `comengy-imports`
   - Access: Private (service role only)
   - Retention: Keep last 30 days of files

2. **Update script to upload files**

   ```typescript
   // After successful download:
   - Upload PO file to: comengy-imports/orders/YYYY-MM-DD-{GUID}.xlsx
   - Upload QS file to: comengy-imports/qs/YYYY-MM-DD-{GUID}.xlsx
   - Store metadata in database (import_jobs table)
   ```

3. **Add error handling**
   - Retry failed uploads (3 attempts)
   - Log failures to database
   - Send alert on repeated failures

### Files to Create/Modify:

- `scripts/fetch-comengy-files.ts` - Add Supabase upload logic
- `scripts/supabase-upload.ts` - Helper functions for file upload
- `.github/workflows/comengy-import.yml` - GitHub Actions workflow

### Success Criteria:

- ✅ Files uploaded to Supabase Storage automatically
- ✅ Upload errors are logged
- ✅ Files accessible via Supabase API

---

## Phase 3: GitHub Actions Workflow

### Status: NOT STARTED

**Goal**: Run download script daily via GitHub Actions

### Tasks:

1. **Create workflow file**: `.github/workflows/comengy-import.yml`

   ```yaml
   name: Comengy Import
   on:
     schedule:
       - cron: '0 2 * * *' # 2 AM daily
     workflow_dispatch: # Manual trigger
   ```

2. **Configure secrets**:
   - `COMENGY_USERNAME`
   - `COMENGY_PASSWORD`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VERCEL_API_URL` (for triggering import)

3. **Setup Puppeteer in Actions**:
   - Install Chrome dependencies
   - Run in headless mode
   - Configure download directory

4. **Add notifications**:
   - Success: Log to database
   - Failure: Send email/Slack alert

### Files to Create:

- `.github/workflows/comengy-import.yml`
- `.github/actions/setup-puppeteer/action.yml` (optional, for reusability)

### Success Criteria:

- ✅ Workflow runs daily at 2 AM UTC
- ✅ Can be triggered manually for testing
- ✅ Sends notifications on success/failure
- ✅ Completes within 5 minutes

---

## Phase 4: Vercel API Endpoint

### Status: NOT STARTED

**Goal**: Process uploaded files via API endpoint

### Tasks:

1. **Create API route**: `src/app/api/import-comengy/route.ts`

   ```typescript
   POST /api/import-comengy
   Body: { files: [{ bucket, path, type }] }
   Response: { success: boolean, imported: { po: number, qs: number } }
   ```

2. **Implement processing logic**:
   - Fetch files from Supabase Storage
   - Parse Excel files (reuse existing parser)
   - Validate data
   - Insert/update database records
   - Update import_jobs status
   - Trigger alerts if needed

3. **Add authentication**:
   - Require API key or service role token
   - Verify request is from GitHub Actions

4. **Error handling**:
   - Return detailed error messages
   - Log errors to database
   - Rollback on partial failures

### Files to Create/Modify:

- `src/app/api/import-comengy/route.ts` - Main API endpoint
- `src/features/imports/processors/comengy-processor.ts` - Business logic
- `src/features/imports/actions.ts` - Update with Comengy-specific logic

### Success Criteria:

- ✅ API processes files correctly
- ✅ Returns meaningful errors
- ✅ Updates database atomically (all or nothing)
- ✅ Completes within 60 seconds (Vercel timeout)

---

## Phase 5: Monitoring & Alerts

### Status: NOT STARTED

**Goal**: Monitor automation health and alert on failures

### Tasks:

1. **Create dashboard page**: `/imports/comengy-status`
   - Show last 30 days of imports
   - Success/failure rates
   - File sizes, record counts
   - Error logs

2. **Add health checks**:
   - Verify files were downloaded today
   - Check file sizes are reasonable
   - Validate record counts
   - Alert if no import for 48 hours

3. **Setup notifications**:
   - Email on failure (Resend)
   - Slack webhook (optional)
   - In-app notifications

### Files to Create:

- `src/app/(app)/imports/comengy-status/page.tsx`
- `src/features/imports/queries/comengy-stats.ts`
- `src/features/alerts/comengy-alerts.ts`

### Success Criteria:

- ✅ Dashboard shows import history
- ✅ Alerts sent on failures
- ✅ Easy to diagnose issues

---

## Phase 6: Testing & Documentation

### Status: NOT STARTED

**Goal**: Ensure system is reliable and well-documented

### Tasks:

1. **Write tests**:
   - Unit tests for Excel parsing
   - Integration tests for API endpoint
   - E2E test for full workflow (mock files)

2. **Load testing**:
   - Test with large Excel files (200k+ rows)
   - Verify Vercel timeout handling
   - Test concurrent imports

3. **Documentation**:
   - Update COMENGY_DOWNLOAD_AUTOMATION.md
   - Add troubleshooting guide
   - Document GitHub Actions secrets setup
   - Create runbook for common issues

4. **Create manual fallback**:
   - UI for uploading files manually
   - Validate uploaded files
   - Process immediately

### Files to Create:

- `src/__tests__/features/imports/comengy-processor.test.ts`
- `src/__tests__/api/import-comengy.test.ts`
- `docs/COMENGY_RUNBOOK.md`
- `src/app/(app)/imports/manual-upload/page.tsx`

### Success Criteria:

- ✅ Test coverage >80%
- ✅ Documentation is complete
- ✅ Manual fallback works
- ✅ Runbook tested by another person

---

## Timeline Estimate

| Phase                   | Effort       | Dependencies        |
| ----------------------- | ------------ | ------------------- |
| Phase 1: Excel Download | 1-2 days     | None                |
| Phase 2: File Storage   | 2-4 hours    | Phase 1 complete    |
| Phase 3: GitHub Actions | 2-4 hours    | Phase 2 complete    |
| Phase 4: API Endpoint   | 4-6 hours    | Phase 3 complete    |
| Phase 5: Monitoring     | 2-4 hours    | Phase 4 complete    |
| Phase 6: Testing & Docs | 4-8 hours    | All phases complete |
| **Total**               | **3-5 days** |                     |

---

## Current Blockers

### Blocker #1: Downloads Not Working in WSL

**Impact**: Cannot complete Phase 1
**Possible Solutions**:

1. Run script on Windows (quick test)
2. Use GitHub Actions environment (production solution)
3. Debug VNC/download issue further

**Recommendation**: Test in GitHub Actions environment next - if it works there, we can skip local development issues.

---

## Decision Log

### 2025-01-09: Use GitHub Actions for Automation

**Decision**: Run download script via GitHub Actions instead of Vercel
**Rationale**:

- Vercel has 60s timeout (too short)
- GitHub Actions supports headless browsers well
- Free tier sufficient
- No need for always-on server

### 2025-01-09: Use Supabase Storage for File Transfer

**Decision**: Store Excel files in Supabase Storage temporarily
**Rationale**:

- Already using Supabase
- Easy integration with API
- Automatic cleanup possible
- Can serve as backup/audit trail

---

## Questions to Answer

1. **Download frequency**: Daily at 2 AM? Or multiple times per day?
   - **Recommendation**: Once daily initially, can increase if needed

2. **File retention**: How long to keep Excel files in Supabase Storage?
   - **Recommendation**: 30 days for debugging, then auto-delete

3. **Failure handling**: What to do if 3 consecutive imports fail?
   - **Recommendation**: Email alert + disable workflow until manually fixed

4. **Data conflicts**: What if same PO appears in multiple imports?
   - **Recommendation**: Use upsert logic (update existing, insert new)

5. **Large files**: What if Excel files are huge (500k+ rows)?
   - **Recommendation**: Stream processing + batch inserts (existing logic handles this)

---

## Next Steps (Priority Order)

1. ✅ Document current state (this file)
2. **🔥 Get Excel downloads working reliably** (Phase 1)
   - Test script on Windows
   - OR test in Docker container
   - OR test in GitHub Actions directly
3. Implement Supabase upload (Phase 2)
4. Create GitHub Actions workflow (Phase 3)
5. Build API endpoint (Phase 4)
6. Add monitoring (Phase 5)
7. Write tests & docs (Phase 6)

---

## Success Metrics

Once fully deployed, track:

- **Uptime**: % of days with successful import (target: >98%)
- **Latency**: Time from download to database (target: <5 minutes)
- **Accuracy**: Records imported vs. expected (target: 100%)
- **Failures**: Number of consecutive failures (target: <3)
- **Manual intervention**: Times requiring manual upload (target: <1/month)

---

## Rollback Plan

If automation fails in production:

1. Disable GitHub Actions workflow
2. Use manual upload UI (Phase 6)
3. Investigate logs from last successful run
4. Fix issue in development
5. Test manually
6. Re-enable workflow

---

## Resources Needed

- GitHub repository (existing)
- Supabase project (existing)
- Vercel project (existing)
- Comengy credentials (existing)
- Email service for alerts (Resend - existing)

**Total Additional Cost**: $0 (all free tiers)
