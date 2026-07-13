import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const explicitBaseUrl = process.env.SMOKE_BASE_URL;
const baseUrl = explicitBaseUrl ?? 'http://127.0.0.1:4173';
const routes = [
  '/workspaces',
  '/w/ws-hq',
  '/w/ws-hq/items',
  '/w/ws-hq/search',
  '/w/ws-hq/containers',
  '/w/ws-hq/members',
  '/w/ws-hq/activity',
  '/w/ws-hq/reports',
  '/w/ws-hq/notifications',
];

function waitForServer(url, timeoutMs = 20_000) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          resolve();
          return;
        }
      } catch {
        // Server is not ready yet.
      }

      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }

      setTimeout(check, 250);
    };

    check();
  });
}

async function main() {
  let server;
  if (!explicitBaseUrl) {
    server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4173'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, BROWSER: 'none' },
    });
    await waitForServer(baseUrl);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`console: ${message.text()}`);
    }
  });

  try {
    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      const status = response?.status() ?? 0;
      if (status < 200 || status >= 400) {
        throw new Error(`${route} returned HTTP ${status}`);
      }
      await page.locator('body').waitFor({ state: 'visible' });
      console.log(`ok ${route}`);
    }

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  } finally {
    await browser.close();
    if (server) {
      server.kill('SIGTERM');
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
