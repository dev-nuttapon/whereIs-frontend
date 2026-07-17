import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const explicitBaseUrl = process.env.SMOKE_BASE_URL;
const baseUrl = explicitBaseUrl ?? 'http://127.0.0.1:4173';
const smokeEmail = process.env.SMOKE_EMAIL ?? 'test@whereis.com';
const smokePassword = process.env.SMOKE_PASSWORD ?? '1234';

function buildAuthState(session, user) {
  return {
    state: {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken ?? null,
      idToken: session.idToken ?? null,
      expiresAt: session.expiresAt ?? null,
      user,
      isAuthenticated: true,
    },
    version: 0,
  };
}

function createEmptyListResponse() {
  return {
    success: true,
    data: {
      items: [],
      total: 0,
    },
  };
}

function createNotificationsResponse() {
  return {
    success: true,
    data: {
      items: [],
      page: 1,
      limit: 20,
      total: 0,
    },
  };
}

function createReportsResponse() {
  return {
    success: true,
    data: [],
  };
}

function createWorkspaceDetail(workspaceId) {
  return {
    success: true,
    data: {
      id: workspaceId,
      name: 'Smoke Workspace',
      slug: 'smoke-workspace',
      type: 'Warehouse',
      ownerUserId: 'smoke-user',
      isActive: true,
      myRoleCode: 'owner',
      permissions: [],
      createdAt: new Date().toISOString(),
    },
  };
}

function createProductDetail(productId) {
  return {
    success: true,
    data: {
      id: productId,
      workspaceId: 'smoke-workspace-id',
      categoryId: null,
      categoryName: null,
      unitCode: 'pcs',
      name: 'Legacy Product',
      description: 'Smoke product',
      code: 'LP-123',
      sku: 'LP-123',
      trackingType: 'Stock',
      minStockAlert: 0,
      imageUrl: null,
      isActive: true,
      assetCount: 0,
      totalStock: 0,
      createdAt: new Date().toISOString(),
    },
  };
}

function mockApiResponse({ pathname, method, workspaceId, user, workspace }) {
  if (method === 'GET' && pathname === '/api/v1/users/me') {
    return { success: true, data: user };
  }

  if (method === 'GET' && pathname === '/api/v1/workspaces') {
    return {
      success: true,
      data: {
        items: [workspace],
        total: 1,
      },
    };
  }

  if (method === 'GET' && pathname === `/api/v1/workspaces/${workspaceId}`) {
    return createWorkspaceDetail(workspaceId);
  }

  if (method === 'GET' && pathname === `/api/v1/workspaces/${workspaceId}/products/legacy-item-123`) {
    return createProductDetail('legacy-item-123');
  }

  if (method === 'GET' && pathname === `/api/v1/workspaces/${workspaceId}/products`) {
    return createEmptyListResponse();
  }

  if (method === 'GET' && pathname === `/api/v1/workspaces/${workspaceId}/items`) {
    return createEmptyListResponse();
  }

  if (method === 'GET' && pathname === `/api/v1/workspaces/${workspaceId}/reports`) {
    return createReportsResponse();
  }

  if (method === 'GET' && pathname === `/api/v1/workspaces/${workspaceId}/notifications`) {
    return createNotificationsResponse();
  }

  if (method === 'GET' && pathname.startsWith(`/api/v1/workspaces/${workspaceId}/`)) {
    if (
      pathname.endsWith('/members') ||
      pathname.endsWith('/containers') ||
      pathname.endsWith('/categories') ||
      pathname.endsWith('/locations') ||
      pathname.endsWith('/sites') ||
      pathname.endsWith('/permissions') ||
      pathname.endsWith('/invitations') ||
      pathname.endsWith('/activity') ||
      pathname.endsWith('/reports') ||
      pathname.endsWith('/notifications') ||
      pathname.endsWith('/assets') ||
      pathname.endsWith('/stock') ||
      pathname.endsWith('/borrow-orders')
    ) {
      return createEmptyListResponse();
    }
  }

  return null;
}

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
  page.on('pageerror', (error) => errors.push(`pageerror @ ${page.url()}: ${error.stack ?? error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      if (message.text().includes('Warning: [antd: Drawer] `width` is deprecated. Please use `size` instead.')) {
        return;
      }
      errors.push(`console: ${message.text()}`);
    }
  });

  try {
    const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: smokeEmail, password: smokePassword }),
    });
    if (!loginResponse.ok) {
      throw new Error(`login failed with HTTP ${loginResponse.status}`);
    }

    const loginJson = await loginResponse.json();
    const authSession = loginJson?.data;
    if (!authSession?.accessToken) {
      throw new Error('login response did not include an access token');
    }

    const userResponse = await fetch(`${baseUrl}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${authSession.accessToken}`,
      },
    });
    if (!userResponse.ok) {
      throw new Error(`user lookup failed with HTTP ${userResponse.status}`);
    }

    const userJson = await userResponse.json();
    const user = {
      id: userJson.data.id,
      email: userJson.data.email,
      name: userJson.data.displayName,
      avatarUrl: userJson.data.avatarUrl ?? undefined,
    };

    const workspaceResponse = await fetch(`${baseUrl}/api/v1/workspaces?page=1&pageSize=100`, {
      headers: {
        Authorization: `Bearer ${authSession.accessToken}`,
      },
    });
    if (!workspaceResponse.ok) {
      throw new Error(`workspace list failed with HTTP ${workspaceResponse.status}`);
    }

    const workspaceJson = await workspaceResponse.json();
    const workspace = workspaceJson?.data?.items?.[0];
    if (!workspace?.id) {
      throw new Error('workspace list returned no accessible workspaces');
    }

    const authState = buildAuthState(authSession, user);
    await page.addInitScript((state) => {
      localStorage.setItem('whereis-auth', JSON.stringify(state));
    }, authState);

    await page.route('**/api/v1/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const response = mockApiResponse({
        pathname: url.pathname,
        method: request.method(),
        workspaceId: workspace.id,
        user,
        workspace,
      });

      if (response) {
        await route.fulfill({ json: response });
        return;
      }

      await route.fulfill({
        status: 200,
        json: createEmptyListResponse(),
      });
    });

    await page.goto(`${baseUrl}/workspaces`, { waitUntil: 'networkidle' });
    await page.waitForURL(/\/workspaces$/);

    const workspaceId = workspace.id;

    await page.route(`**/api/v1/workspaces/${workspaceId}`, async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: {
            id: workspaceId,
            name: 'Smoke Workspace',
            slug: 'smoke-workspace',
            type: 'Warehouse',
            ownerUserId: 'smoke-user',
            isActive: true,
            myRoleCode: 'owner',
            permissions: [],
            createdAt: new Date().toISOString(),
          },
        },
      });
    });

    const routes = [
      '/workspaces',
      `/w/${workspaceId}`,
      `/w/${workspaceId}/items`,
      `/w/${workspaceId}/search`,
      `/w/${workspaceId}/containers`,
      `/w/${workspaceId}/members`,
      `/w/${workspaceId}/activity`,
      `/w/${workspaceId}/reports`,
      `/w/${workspaceId}/notifications`,
    ];

    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      const status = response?.status() ?? 0;
      if (status < 200 || status >= 400) {
        throw new Error(`${route} returned HTTP ${status}`);
      }
      await page.locator('body').waitFor({ state: 'visible' });
      console.log(`ok ${route}`);
    }

    await page.goto(`${baseUrl}/w/${workspaceId}/items`, { waitUntil: 'networkidle' });
    await page.waitForURL(new RegExp(`/w/${workspaceId}/products$`), { timeout: 20_000 });
    if (!page.url().endsWith(`/w/${workspaceId}/products`)) {
      throw new Error(`legacy items list did not redirect to products: ${page.url()}`);
    }
    await page.locator('body').waitFor({ state: 'visible' });

    await page.goto(`${baseUrl}/w/${workspaceId}/items/legacy-item-123`, { waitUntil: 'networkidle' });
    await page.waitForURL(new RegExp(`/w/${workspaceId}/products/legacy-item-123$`), { timeout: 20_000 });
    if (!page.url().endsWith(`/w/${workspaceId}/products/legacy-item-123`)) {
      throw new Error(`legacy item detail did not redirect to the canonical product detail route: ${page.url()}`);
    }
    await page.locator('body').waitFor({ state: 'visible' });

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
