// Generate the portfolio PDF from the /print route using headless Chrome.
// Prereq: a server is serving the site (e.g. `npm run preview` on :4321).
// Usage: npm run pdf   (override URL/OUT/CHROME_PATH via env vars)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const URL = process.env.PRINT_URL ?? 'http://localhost:4321/print';
const OUT = resolve(process.cwd(), process.env.PDF_OUT ?? 'public/yoon-chanmin-portfolio.pdf');

const candidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean);

const chrome = candidates.find((p) => existsSync(p));
if (!chrome) {
  console.error('Chrome/Chromium not found. Set CHROME_PATH to your browser binary.');
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });

execFileSync(chrome, [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--virtual-time-budget=6000',
  '--run-all-compositor-stages-before-draw',
  `--print-to-pdf=${OUT}`,
  '--user-data-dir=/tmp/portfolio-pdf-profile',
  URL,
], { stdio: 'inherit' });

console.log(`Wrote ${OUT}`);
