# Comengy Download Automation - Quick Start

## Installation

```bash
# Install dependencies
npm install

# The script requires puppeteer and tsx (already in package.json)
```

## Running the Automation

```bash
# Run the automation script
npm run fetch:comengy
```

## What It Does

1. Opens browser window (1158x739 pixels)
2. Logs into Comengy portal (DOWREAD-ICS / DOW_READ_ICS)
3. Downloads Purchase Orders Excel file
4. Downloads Quantity Survey Excel file
5. Moves files to `AES Excel Files/` directory

## Expected Output

```
Starting Comengy file fetch automation...
Launching browser...
Navigating to login page...
Waiting for login form...
Filling credentials...
Submitting login...
Waiting for VNC connection (10 seconds)...
VNC connected successfully
Login complete, VNC helpers defined
Starting Purchase Orders download...
Clicking Favorites tab (97, 46)...
Clicking Purchase Orders icon (266, 89)...
Double-clicking dataset field (813, 163)...
Typing 1000000...
Clicking Execute button (969, 163)...
Waiting 6 seconds for query execution...
Right-clicking data row (400, 325)...
Clicking Excel export (469, 570)...
Waiting 5 seconds for download to start...
Purchase Orders download complete
Starting Quantity Survey download...
[... similar output for QS ...]
✓ Files downloaded successfully!
  PO File: /home/clachance14/projects/AESTrak/AES Excel Files/DOWREAD-ICS.orders.{GUID}.xlsx
  QS File: /home/clachance14/projects/AESTrak/AES Excel Files/DOWREAD-ICS.QS.{GUID}.xlsx
```

## Files Created

After successful run, two files will be in `AES Excel Files/`:

- `DOWREAD-ICS.orders.{GUID}.xlsx` - Purchase Orders
- `DOWREAD-ICS.QS.{GUID}.xlsx` - Quantity Surveys

## Next Steps

Import the downloaded files into the database:

```bash
python scripts/generate_excel_seed.py --organization-id <ORG_ID>
```

## Troubleshooting

### Browser doesn't open

- Check that Puppeteer is installed: `npm install puppeteer`
- Verify Chrome/Chromium is available on your system

### Login fails

- Check credentials in script or set environment variables:
  ```bash
  export COMENGY_USERNAME=DOWREAD-ICS
  export COMENGY_PASSWORD=DOW_READ_ICS
  ```

### Downloads fail

- Ensure `~/Downloads/` directory exists
- Check browser's download permissions
- Verify network connectivity to Comengy portal

### Files not found

- Check `~/Downloads/` for files matching patterns
- Increase wait times in script if portal is slow
- Look for error messages in console output

## Configuration

### Change Canvas Size

If Comengy interface changes, update in `scripts/fetch-comengy-files.ts`:

```typescript
const CANVAS_WIDTH = 1158;
const CANVAS_HEIGHT = 739;
```

### Change Download Location

Update in `scripts/fetch-comengy-files.ts`:

```typescript
const DOWNLOAD_DIR = path.join(process.env.HOME || '', 'Downloads');
const PROJECT_DIR = path.join(__dirname, '..', 'AES Excel Files');
```

## Advanced Usage

### Run with Custom Credentials

```bash
COMENGY_USERNAME=your-username COMENGY_PASSWORD=your-password npm run fetch:comengy
```

### Enable Headless Mode

Edit `scripts/fetch-comengy-files.ts`:

```typescript
browser = await puppeteer.launch({
  headless: true, // Change to true
  // ...
});
```

### Add to Cron Job

```bash
# Run daily at 2 AM
0 2 * * * cd /home/clachance14/projects/AESTrak && npm run fetch:comengy >> /var/log/comengy-fetch.log 2>&1
```

## Documentation

See [COMENGY_DOWNLOAD_AUTOMATION.md](./COMENGY_DOWNLOAD_AUTOMATION.md) for complete documentation including:

- Detailed workflow steps
- Coordinate reference map
- VNC control functions
- Error handling
- Security notes
- Troubleshooting guide
