# Resume Comengy Automation Session

## Quick Start Prompt

Copy and paste this into your new Claude Code session after restart:

---

**Context:** We're automating Excel file downloads from the Comengy contractors portal (https://contractors.comengy.com/?signin) using Chrome MCP with VNC WebSocket control. We've set up Xvfb virtual display so Chrome can render the canvas-based interface.

**Current Status:**

- ✅ Xvfb is running on display :100 (PID should be visible via `ps aux | grep Xvfb`)
- ✅ Environment variable DISPLAY=:100 is set in the terminal
- ✅ Chrome MCP needs to restart with this DISPLAY variable
- ✅ Documentation exists at `docs/COMENGY_DOWNLOAD_AUTOMATION.md`

**Credentials:**

- URL: https://contractors.comengy.com/?signin
- Username: DOWREAD-ICS
- Password: DOW_READ_ICS

**What We Need to Do:**

1. Verify Chrome MCP is using DISPLAY=:100 (check if VNC canvas renders properly)
2. Test Purchase Orders download workflow:
   - Click PO icon at (80, 80)
   - Set "No. of Dataset" to 1000000
   - Click Execute
   - Right-click data row, type 'X' for Excel export
   - Verify file downloads to `/mnt/c/Users/clach/Downloads/`

3. Test Quantity Survey download workflow:
   - Click Q.S. icon at (445, 120)
   - Set "Row Count" to 1000000
   - Click Execute
   - Deselect Management Group filter checkbox at (30, 374)
   - Right-click data row, click "Excel export" from menu
   - Verify file downloads to `/mnt/c/Users/clach/Downloads/`

4. Create final automation TypeScript script at `scripts/fetch-comengy-files.ts`
5. Update documentation with complete working coordinates

**Key VNC Commands Available:**

```javascript
window.vncClick(x, y); // Left click
window.TVNC.sendMouse(2, x, y); // Right click down
window.TVNC.sendMouse(0, x, y); // Mouse up
window.vncType(text); // Type text
window.vncKeyPress(keyCode); // Special keys
```

**Critical Coordinates:**

- PO Icon: (80, 80)
- PO Dataset Field: (150, 93)
- PO Execute Button: (331, 93)
- Q.S. Icon: (445, 120)
- Q.S. Row Count Field: (160, 90)
- Q.S. Execute Button: (299, 90)
- Q.S. Filter Checkbox: (30, 374)

**Important Notes:**

- PO export shortcut: Type 'X' after right-click
- Q.S. export: Click "Excel export" from context menu (not a shortcut)
- Always deselect the Management Group filter checkbox for Q.S.
- Do NOT execute again after deselecting checkbox

**First Command to Run:**
Start by navigating to the login page and logging in:

```
Navigate to https://contractors.comengy.com/?signin and login with the credentials above, then proceed with testing the PO download workflow.
```

---

## Before Starting Checklist

Run these commands in your terminal before starting Claude Code:

```bash
# 1. Verify Xvfb is running
ps aux | grep Xvfb | grep -v grep
# Should show: Xvfb :100 -screen 0 1920x1200x24

# 2. If Xvfb is not running, start it:
Xvfb :100 -screen 0 1920x1200x24 > /dev/null 2>&1 &

# 3. Set DISPLAY variable
export DISPLAY=:100

# 4. Launch Claude Code from this terminal
claude-code
# (or however you normally launch it)
```

## Files Created/Modified

- `docs/COMENGY_DOWNLOAD_AUTOMATION.md` - Documentation (needs updating with final coordinates)
- `scripts/fetch-comengy-files.ts` - Automation script (placeholder, needs implementation)
- This file: `RESUME_COMENGY_AUTOMATION.md`

## Download Location

Files download to: `/mnt/c/Users/clach/Downloads/`

- Pattern: `DOWREAD-ICS.orders.{GUID}.xlsx` (Purchase Orders)
- Pattern: `DOWREAD-ICS.QS.{GUID}.xlsx` (Quantity Surveys)
