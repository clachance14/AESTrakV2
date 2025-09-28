# Comengy Excel File Download Automation

## Overview

This document describes the automated workflow for downloading Purchase Orders and Quantity Survey Excel files from the Comengy contractors portal using Puppeteer with VNC/ThinVNC WebSocket control.

## Prerequisites

- Node.js and npm installed
- Puppeteer browser automation library
- Access to Comengy portal credentials:
  - **URL**: `https://contractors.comengy.com/?signin`
  - **Username**: `DOWREAD-ICS`
  - **Password**: `DOW_READ_ICS`

## Architecture

The Comengy portal runs on a VNC/ThinVNC-based remote desktop interface rendered on HTML canvas. Traditional DOM-based automation doesn't work because the UI is rendered as pixels on a canvas. Instead, we use:

- **Puppeteer** for browser automation
- **WebSocket VNC protocol** for sending mouse/keyboard events
- **Coordinate-based clicking** instead of element selectors
- **Canvas size**: 1158x739 pixels (critical for coordinate accuracy)

## VNC Control Functions

The following JavaScript functions are injected into the browser context:

```javascript
window.vncClick = function (x, y) {
  window.TVNC.sendMouse(1, x, y); // Button 1 = left click
  setTimeout(() => window.TVNC.sendMouse(0, x, y), 50); // Release
};

window.vncDoubleClick = function (x, y) {
  window.TVNC.sendMouse(1, x, y);
  setTimeout(() => window.TVNC.sendMouse(0, x, y), 50);
  setTimeout(() => {
    window.TVNC.sendMouse(1, x, y);
    setTimeout(() => window.TVNC.sendMouse(0, x, y), 50);
  }, 100);
};

window.vncRightClick = function (x, y) {
  window.TVNC.sendMouse(2, x, y); // Button 2 = right click
  setTimeout(() => window.TVNC.sendMouse(0, x, y), 50);
};

window.vncType = function (text) {
  for (let char of text) {
    const code = char.charCodeAt(0);
    window.TVNC.sendKey(code, true); // Key down
    window.TVNC.sendKey(code, false); // Key up
  }
};
```

## Complete Workflow

### Step 1: Login

Navigate to the login page and authenticate:

```typescript
await page.goto('https://contractors.comengy.com/?signin');
await page.type('input[type="text"]', 'DOWREAD-ICS');
await page.type('input[type="password"]', 'DOW_READ_ICS');
await page.keyboard.press('Enter');
await sleep(10000); // Wait 10 seconds for VNC to connect
```

**Wait Time**: 10 seconds for system load and VNC connection

### Step 2: Purchase Orders Download

#### 2.1 Access Favorites Tab

```javascript
window.vncClick(97, 46); // Click Favorites tab
await sleep(1000);
```

**Coordinates**: (97, 46)
**Visual Reference**: Favorites tab at top of interface

#### 2.2 Open Purchase Orders Module

```javascript
window.vncClick(266, 89); // Click Purchase Orders icon (yellow book)
await sleep(2000);
```

**Coordinates**: (266, 89)
**Visual Reference**: Yellow book icon labeled "Purchase Orders"

#### 2.3 Configure Dataset Limit

```javascript
window.vncDoubleClick(813, 163); // Double-click dataset field
await sleep(500);
window.vncType('1000000');
await sleep(500);
```

**Coordinates**: (813, 163) - "No. of Dataset" input field
**Technique**: Use double-click to select all text
**Default Value**: 25000
**Required Value**: 1000000 (to ensure all records are retrieved)

#### 2.4 Execute Query

```javascript
window.vncClick(969, 163); // Click Execute button
await sleep(6000); // Wait for results to load
```

**Coordinates**: (969, 163) - "Execute" button (blue)
**Wait Time**: 6 seconds for query execution

#### 2.5 Export to Excel

```javascript
window.vncRightClick(400, 325); // Right-click on a table row
await sleep(1000);
window.vncClick(469, 570); // Click "Excel export" option
await sleep(5000); // Wait for download
```

**Right-click Coordinates**: (400, 325) - Any row in the results table
**Menu Coordinates**: (469, 570) - "Excel export" menu option
**Wait Time**: 5 seconds for download to complete

### Step 3: Quantity Survey Download

#### 3.1 Access Favorites Tab

```javascript
window.vncClick(97, 46); // Click Favorites tab
await sleep(1000);
```

**Coordinates**: (97, 46)
**Note**: Must click Favorites tab again after switching modules

#### 3.2 Open Q.S. Module

```javascript
window.vncClick(386, 89); // Click Q.S. icon
await sleep(2000);
```

**Coordinates**: (386, 89)
**Visual Reference**: Q.S. icon in Favorites tab

#### 3.3 Configure Row Count

```javascript
window.vncDoubleClick(850, 163); // Double-click row count field
await sleep(500);
window.vncType('1000000');
await sleep(500);
```

**Coordinates**: (850, 163) - "Row Count" input field
**Technique**: Use double-click to select all text
**Required Value**: 1000000

#### 3.4 Execute Query

```javascript
window.vncClick(969, 163); // Click Execute button
await sleep(6000); // Wait for results to load
```

**Coordinates**: (969, 163) - "Execute" button
**Wait Time**: 6 seconds for query execution

#### 3.5 Disable Management Group Filter

```javascript
window.vncClick(10, 677); // Uncheck Management Group filter
await sleep(500);
```

**Coordinates**: (10, 677) - Management Group filter checkbox
**Purpose**: Ensures all records are included in export
**Important**: Do NOT execute query again after unchecking

#### 3.6 Export to Excel

```javascript
window.vncRightClick(400, 350); // Right-click on a table row
await sleep(1000);
window.vncClick(469, 570); // Click "Excel export" option
await sleep(5000); // Wait for download
```

**Right-click Coordinates**: (400, 350) - Any row in the results table
**Menu Coordinates**: (469, 570) - "Excel export" menu option
**Wait Time**: 5 seconds for download to complete

### Step 4: File Management

#### 4.1 Verify Downloads

Downloaded files appear in the user's Downloads folder with these naming patterns:

```
DOWREAD-ICS.orders.{GUID}.xlsx      # Purchase Orders
DOWREAD-ICS.QS.{GUID}.xlsx          # Quantity Surveys
```

#### 4.2 Move Files to Project

```bash
# Create directory if it doesn't exist
mkdir -p "/home/clachance14/projects/AESTrak/AES Excel Files"

# Move files to project directory
mv ~/Downloads/DOWREAD-ICS.orders.*.xlsx "/home/clachance14/projects/AESTrak/AES Excel Files/"
mv ~/Downloads/DOWREAD-ICS.QS.*.xlsx "/home/clachance14/projects/AESTrak/AES Excel Files/"
```

## Coordinate Reference Map

| Element                 | X   | Y   | Description                                        |
| ----------------------- | --- | --- | -------------------------------------------------- |
| Favorites Tab           | 97  | 46  | Access Favorites menu (must click between modules) |
| Purchase Orders Icon    | 266 | 89  | Yellow book icon in Favorites                      |
| Q.S. Icon               | 386 | 89  | Q.S. icon in Favorites                             |
| PO Dataset Field        | 813 | 163 | "No. of Dataset" input field                       |
| QS Row Count Field      | 850 | 163 | "Row Count" input field                            |
| Execute Button          | 969 | 163 | Blue Execute button (both modules)                 |
| PO Table Row            | 400 | 325 | Any row in PO results for right-click              |
| QS Table Row            | 400 | 350 | Any row in QS results for right-click              |
| Excel Export Menu       | 469 | 570 | "Excel export" option in context menu              |
| Management Group Filter | 10  | 677 | Filter checkbox in Q.S. module                     |

## Automation Script Usage

### Installation

```bash
npm install puppeteer tsx
```

### Running the Script

```bash
# Using npm script
npm run fetch:comengy

# Or directly with tsx
tsx scripts/fetch-comengy-files.ts
```

### Environment Variables (Optional)

Set these in `.env.local` if you want to override defaults:

```bash
COMENGY_USERNAME=DOWREAD-ICS
COMENGY_PASSWORD=DOW_READ_ICS
```

### Script Location

```
scripts/fetch-comengy-files.ts
```

## Critical Implementation Details

### Canvas Size

- **Width**: 1158 pixels
- **Height**: 739 pixels
- **Importance**: All coordinates are relative to this canvas size
- **Puppeteer Configuration**:
  ```typescript
  await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1158, height: 739 },
    args: ['--window-size=1158,739'],
  });
  ```

### Wait Times

- **Login**: 10 seconds (VNC connection establishment)
- **Module Load**: 1-2 seconds after clicking icons
- **Query Execution**: 6 seconds (both PO and QS)
- **Download Start**: 5 seconds after clicking Excel export

### Text Selection Technique

- **Use double-click**, not triple-click or Ctrl+A
- Double-click selects the entire field value
- Works reliably for both dataset and row count fields

### Module Navigation

- **Always click Favorites tab** (97, 46) before accessing a module
- Required even when switching between modules
- Ensures the interface is in the correct state

### Management Group Filter

- **Only in Q.S. module**
- Uncheck at coordinates (10, 677) after query executes
- Do NOT re-execute query after unchecking
- Ensures all records are included in export

## Error Handling

### VNC Connection Failed

**Issue**: VNC doesn't connect within 30 seconds
**Solution**:

- Verify network connectivity to Comengy portal
- Check that ThinVNC/VNC service is running
- Increase wait time if portal is slow

### Download Not Starting

**Issue**: Excel export doesn't trigger
**Solution**:

1. Verify right-click registered (context menu appears)
2. Ensure correct coordinates for menu click
3. Check browser download settings
4. Verify sufficient wait time before checking for files

### Wrong Record Count

**Issue**: Dataset limit not updated correctly
**Solution**:

1. Verify field was double-clicked (text selected)
2. Ensure old value was cleared before typing
3. Confirm new value (1000000) was typed completely

### Files Not Found

**Issue**: Downloaded files don't appear in expected location
**Solution**:

1. Check `~/Downloads/` directory
2. Verify file naming pattern matches expected
3. Ensure sufficient wait time for download
4. Check browser's download progress

## File Naming Convention

Downloaded files follow this pattern:

```
DOWREAD-ICS.orders.{GUID}.xlsx      # Purchase Orders
DOWREAD-ICS.QS.{GUID}.xlsx          # Quantity Surveys
```

The GUID is generated by the Comengy system and ensures unique filenames for each download.

## Integration with AESTrak Import Pipeline

After successful download, files are moved to:

```
/home/clachance14/projects/AESTrak/AES Excel Files/
```

Run the existing Python seed generator to import:

```bash
cd /home/clachance14/projects/AESTrak
python scripts/generate_excel_seed.py --organization-id <ORG_ID>
```

## Security Notes

- Credentials stored in environment variables (`.env.local`)
- Never commit credentials to version control
- Downloads occur over HTTPS
- VNC session is isolated within browser context
- Browser closes automatically after completion

## Troubleshooting

### Visual Debugging

To capture the VNC canvas for debugging:

```javascript
const canvas = document.querySelectorAll('canvas')[2]; // Main rendering canvas
const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
// Save or inspect dataUrl
```

### Verify VNC Connection

Check TVNC connection status:

```javascript
{
  connected: window.TVNC?.connected,
  wsEnabled: window.TVNC?.wsEnabled,
  screenWidth: window.TVNC?.screenWidth,
  screenHeight: window.TVNC?.screenHeight,
  inputEnabled: window.TVNC?.inputEnabled
}
```

Expected values:

- `connected`: true
- `wsEnabled`: true
- `screenWidth`: 1920
- `screenHeight`: 1200
- `inputEnabled`: true

### Coordinate Verification

If coordinates don't work as expected:

1. Verify canvas size matches 1158x739
2. Check that viewport is set correctly in Puppeteer
3. Take screenshot and measure actual pixel locations
4. Account for any UI scaling or zoom

## Future Enhancements

1. **Scheduled Downloads**: Add cron job for automated daily downloads
2. **Email Notifications**: Alert on successful/failed downloads
3. **Diff Detection**: Compare new files with previous versions
4. **Auto-Import**: Trigger database import after successful download
5. **Retry Logic**: Handle transient network failures with exponential backoff
6. **Headless Mode**: Enable fully automated operation without visible browser
7. **Download Progress**: Monitor and log download progress
8. **File Validation**: Verify downloaded files are valid Excel format

## Maintenance

### Updating Coordinates

If the Comengy interface changes:

1. Use Claude Browser to document new workflow
2. Maintain canvas size consistency (1158x739)
3. Update coordinates in this documentation
4. Update coordinates in `scripts/fetch-comengy-files.ts`
5. Test thoroughly before deploying

### Version History

- **2025-01-09**: Initial automation implementation with verified coordinates
- Canvas size: 1158x739 pixels
- Documented complete PO and QS workflows
