import * as fs from 'fs';
import * as path from 'path';

import puppeteer, { type Browser, type Page } from 'puppeteer';

const COMENGY_LOGIN_URL = 'https://contractors.comengy.com/?signin';
const CANVAS_WIDTH = 1158;
const CANVAS_HEIGHT = 739;
const DOWNLOAD_DIR = path.join(process.env.HOME || '', 'Downloads');
const PROJECT_DIR = path.join(__dirname, '..', 'AES Excel Files');

interface FetchResult {
  success: boolean;
  poFilePath?: string;
  qsFilePath?: string;
  error?: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface VNCWindow extends Window {
  TVNC: {
    sendMouse: (button: number, x: number, y: number) => void;
    sendKey: (keyCode: number, down: boolean) => void;
    connected?: boolean;
  };
  vncClick: (x: number, y: number) => void;
  vncDoubleClick: (x: number, y: number) => void;
  vncRightClick: (x: number, y: number) => void;
  vncType: (text: string) => void;
}

async function defineVncHelpers(page: Page): Promise<void> {
  await page.evaluate(() => {
    const win = window as unknown as VNCWindow;
    win.vncClick = function (x: number, y: number) {
      win.TVNC.sendMouse(1, x, y);
      setTimeout(() => win.TVNC.sendMouse(0, x, y), 50);
    };

    win.vncDoubleClick = function (x: number, y: number) {
      win.TVNC.sendMouse(1, x, y);
      setTimeout(() => win.TVNC.sendMouse(0, x, y), 50);
      setTimeout(() => {
        win.TVNC.sendMouse(1, x, y);
        setTimeout(() => win.TVNC.sendMouse(0, x, y), 50);
      }, 100);
    };

    win.vncRightClick = function (x: number, y: number) {
      win.TVNC.sendMouse(2, x, y);
      setTimeout(() => win.TVNC.sendMouse(0, x, y), 50);
    };

    win.vncType = function (text: string) {
      for (const char of text) {
        const code = char.charCodeAt(0);
        win.TVNC.sendKey(code, true);
        win.TVNC.sendKey(code, false);
      }
    };
  });
}

async function waitForVncConnection(page: Page): Promise<boolean> {
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    const connected = await page.evaluate(() => {
      const win = window as unknown as VNCWindow;
      return win.TVNC?.connected === true;
    });
    if (connected) {
      console.log('VNC connected successfully');
      return true;
    }
    await sleep(1000);
  }
  return false;
}

async function login(page: Page): Promise<void> {
  console.log('Navigating to login page...');
  await page.goto(COMENGY_LOGIN_URL, { waitUntil: 'networkidle2' });

  console.log('Waiting for login form...');
  await page.waitForSelector('input[type="text"]', { timeout: 10000 });
  await page.waitForSelector('input[type="password"]', { timeout: 10000 });

  console.log('Filling credentials...');
  await page.type('input[type="text"]', process.env.COMENGY_USERNAME || 'DOWREAD-ICS');
  await page.type('input[type="password"]', process.env.COMENGY_PASSWORD || 'DOW_READ_ICS');

  console.log('Submitting login...');
  await page.keyboard.press('Enter');

  console.log('Waiting for VNC connection (10 seconds)...');
  await sleep(10000);

  const connected = await waitForVncConnection(page);
  if (!connected) {
    throw new Error('VNC connection failed');
  }

  await defineVncHelpers(page);
  console.log('Login complete, VNC helpers defined');
}

async function downloadPurchaseOrders(page: Page): Promise<void> {
  console.log('Starting Purchase Orders download...');

  console.log('Clicking Favorites tab (97, 46)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncClick(97, 46));
  await sleep(1000);

  console.log('Clicking Purchase Orders icon (266, 89)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncClick(266, 89));
  await sleep(2000);

  console.log('Double-clicking dataset field (813, 163)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncDoubleClick(813, 163));
  await sleep(500);

  console.log('Typing 1000000...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncType('1000000'));
  await sleep(500);

  console.log('Clicking Execute button (969, 163)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncClick(969, 163));

  console.log('Waiting 6 seconds for query execution...');
  await sleep(6000);

  console.log('Right-clicking data row (400, 325)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncRightClick(400, 325));
  await sleep(2000);

  await page.screenshot({ path: 'debug-po-rightclick.png' });
  console.log('Screenshot saved: debug-po-rightclick.png');

  console.log('Clicking Excel export (469, 570)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncClick(469, 570));

  console.log('Waiting 5 seconds for download to start...');
  await sleep(5000);

  console.log('Purchase Orders download complete');
}

async function downloadQuantitySurvey(page: Page): Promise<void> {
  console.log('Starting Quantity Survey download...');

  console.log('Clicking Favorites tab (97, 46)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncClick(97, 46));
  await sleep(1000);

  console.log('Clicking Q.S. icon (386, 89)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncClick(386, 89));
  await sleep(2000);

  console.log('Double-clicking row count field (850, 163)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncDoubleClick(850, 163));
  await sleep(500);

  console.log('Typing 1000000...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncType('1000000'));
  await sleep(500);

  console.log('Clicking Execute button (969, 163)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncClick(969, 163));

  console.log('Waiting 6 seconds for query execution...');
  await sleep(6000);

  console.log('Unchecking Management Group filter (10, 677)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncClick(10, 677));
  await sleep(500);

  console.log('Right-clicking data row (400, 350)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncRightClick(400, 350));
  await sleep(2000);

  await page.screenshot({ path: 'debug-qs-rightclick.png' });
  console.log('Screenshot saved: debug-qs-rightclick.png');

  console.log('Clicking Excel export (469, 570)...');
  await page.evaluate(() => (window as unknown as VNCWindow).vncClick(469, 570));

  console.log('Waiting 5 seconds for download to start...');
  await sleep(5000);

  console.log('Quantity Survey download complete');
}

function findLatestFile(pattern: string): string | null {
  const files = fs.readdirSync(DOWNLOAD_DIR);
  const matchingFiles = files
    .filter((file) => file.includes(pattern))
    .map((file) => ({
      name: file,
      path: path.join(DOWNLOAD_DIR, file),
      mtime: fs.statSync(path.join(DOWNLOAD_DIR, file)).mtime,
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  return matchingFiles.length > 0 ? matchingFiles[0].path : null;
}

function moveFile(sourcePath: string, destDir: string): string {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const fileName = path.basename(sourcePath);
  const destPath = path.join(destDir, fileName);

  fs.renameSync(sourcePath, destPath);
  console.log(`Moved ${fileName} to ${destDir}`);

  return destPath;
}

async function fetchComenyFiles(): Promise<FetchResult> {
  let browser: Browser | null = null;

  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      },
      args: [
        `--window-size=${CANVAS_WIDTH},${CANVAS_HEIGHT}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });

    const page = await browser.newPage();

    const client = await page.createCDPSession();
    await client.send('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: DOWNLOAD_DIR,
    });
    console.log(`Download directory set to: ${DOWNLOAD_DIR}`);

    await login(page);

    await downloadPurchaseOrders(page);

    await downloadQuantitySurvey(page);

    console.log('Waiting for downloads to complete (15 seconds)...');
    await sleep(15000);

    console.log(`Looking for downloaded files in: ${DOWNLOAD_DIR}`);
    console.log('Files in download directory:');
    try {
      const files = fs.readdirSync(DOWNLOAD_DIR);
      files.filter((f) => f.includes('DOWREAD-ICS')).forEach((f) => console.log(`  - ${f}`));
    } catch (e) {
      console.log('  Error listing files:', e);
    }

    const poFile = findLatestFile('DOWREAD-ICS.orders');
    const qsFile = findLatestFile('DOWREAD-ICS.QS');

    if (!poFile || !qsFile) {
      throw new Error(
        `Files not found. PO: ${poFile ? 'found' : 'missing'}, QS: ${qsFile ? 'found' : 'missing'}`,
      );
    }

    console.log(`Found PO file: ${poFile}`);
    console.log(`Found QS file: ${qsFile}`);

    const poDestPath = moveFile(poFile, PROJECT_DIR);
    const qsDestPath = moveFile(qsFile, PROJECT_DIR);

    console.log('\n✓ Success! Browser will stay open for 30 seconds for verification...');
    await sleep(30000);

    return {
      success: true,
      poFilePath: poDestPath,
      qsFilePath: qsDestPath,
    };
  } catch (error) {
    console.error('Error fetching Comengy files:', error);
    console.log('\n✗ Error occurred. Browser will stay open for 30 seconds for debugging...');
    await sleep(30000);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function main() {
  console.log('Starting Comengy file fetch automation...');
  const result = await fetchComenyFiles();

  if (result.success) {
    console.log('✓ Files downloaded successfully!');
    console.log(`  PO File: ${result.poFilePath}`);
    console.log(`  QS File: ${result.qsFilePath}`);
    process.exit(0);
  } else {
    console.error('✗ Failed to fetch files:', result.error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { fetchComenyFiles };
