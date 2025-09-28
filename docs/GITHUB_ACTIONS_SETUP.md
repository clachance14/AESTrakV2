# GitHub Actions Setup Guide

## What This Does

This GitHub Actions workflow will:

1. Run the Comengy download script in a clean Ubuntu environment
2. Attempt to download the Excel files
3. Upload any downloaded files as artifacts you can download
4. Upload debug screenshots to help diagnose issues

## Setup Steps

### 1. Push the workflow file to GitHub

The workflow file is located at: `.github/workflows/test-comengy-download.yml`

```bash
git add .github/workflows/test-comengy-download.yml
git commit -m "Add Comengy download test workflow"
git push origin main
```

### 2. Add secrets to GitHub repository

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/AESTrak`
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**
5. Add these secrets:

   **Secret 1:**
   - Name: `COMENGY_USERNAME`
   - Value: `DOWREAD-ICS`

   **Secret 2:**
   - Name: `COMENGY_PASSWORD`
   - Value: `DOW_READ_ICS`

### 3. Run the workflow manually

1. Go to **Actions** tab in your GitHub repository
2. Click **Test Comengy Download** workflow (left sidebar)
3. Click **Run workflow** button (right side)
4. Select branch: `main`
5. Click **Run workflow** (green button)

### 4. Monitor the workflow

The workflow will take 2-3 minutes to run. You'll see:

- ✅ Green checkmarks = steps succeeded
- ❌ Red X's = steps failed
- 🟡 Yellow = still running

### 5. Download the results

Once the workflow completes:

1. Click on the workflow run
2. Scroll down to **Artifacts** section
3. Download:
   - `comengy-downloads` - Contains Excel files (if any were downloaded)
   - `debug-screenshots` - Contains screenshots of right-click menus

### 6. Check the logs

Click on each step to see detailed logs:

- Look for "Files in Downloads directory"
- Check for any error messages
- See if VNC connected successfully

## What to Look For

### Success Indicators:

- ✅ "VNC connected successfully"
- ✅ "Purchase Orders download complete"
- ✅ "Quantity Survey download complete"
- ✅ Files listed in "Downloaded files" section
- ✅ Artifacts contain Excel files

### Failure Indicators:

- ❌ "VNC connection failed"
- ❌ "Files not found"
- ❌ No artifacts uploaded
- ❌ Empty Downloads directory

## Troubleshooting

### If workflow fails at "Install dependencies":

- Check that `package.json` is committed
- Check that `package-lock.json` is committed

### If workflow fails at "Run Comengy download script":

- Check the logs for specific error messages
- Look for "Error fetching Comengy files"
- Download debug screenshots to see what happened

### If no files are downloaded:

- Check if VNC connection succeeded
- Download debug screenshots to see menu state
- Verify coordinates are correct for Ubuntu screen size

## Next Steps Based on Results

### If downloads work:

✅ **Success!** We can proceed with:

- Phase 2: Upload to Supabase Storage
- Phase 3: Schedule daily runs
- Phase 4: Build API endpoint

### If downloads fail:

Need to debug:

- Review screenshots
- Adjust coordinates if needed
- Try different wait times
- May need to test on Windows instead

## Workflow Schedule (Future)

Once testing is successful, we'll change the workflow to run automatically:

```yaml
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC
  workflow_dispatch: # Keep manual trigger for testing
```

## Cost

GitHub Actions free tier includes:

- **2,000 minutes/month** for private repositories
- **Unlimited minutes** for public repositories

This workflow uses ~3 minutes per run, so:

- Daily runs = ~90 minutes/month
- Well within free tier limits

## Security Notes

- Credentials are stored as encrypted secrets
- Only accessible during workflow execution
- Not visible in logs or artifacts
- Can be rotated anytime in Settings → Secrets
