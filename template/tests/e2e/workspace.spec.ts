import { _electron as electron, expect, test } from '@playwright/test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test.skip(process.platform === 'linux' && !process.env.DISPLAY, 'Electron requires an X server');

test('title-bar tabs and command launcher work', async () => {
  const application = await electron.launch({ args: ['./out/main/index.js'] });

  try {
    const page = await application.firstWindow();
    page.on('pageerror', (error) => console.error('Electron renderer error:', error));
    page.on('console', (message) => {
      if (message.type() === 'error') console.error('Electron console:', message.text());
    });
    await page.waitForLoadState('load');
    await expect(page.getByRole('tab', { name: 'Workspace' })).toBeVisible();

    await page.getByRole('button', { name: 'New tab', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Workspace' })).toHaveCount(2);

    await page.getByRole('button', { name: 'Search commands' }).click();
    await expect(page.getByPlaceholder('Search commands and actions…')).toBeVisible();
    await page.getByPlaceholder('Search commands and actions…').fill('settings');
    await page.getByRole('option', { name: /Open settings/ }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    await page
      .locator('.settings-action')
      .filter({ hasText: 'Switch theme' })
      .getByRole('button', { name: 'Pin' })
      .click();
    await expect(page.getByRole('button', { name: 'Switch theme' })).toBeVisible();
  } finally {
    await application.close();
  }
});

test('concurrent settings updates persist the latest values', async () => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'electron-settings-'));
  const application = await electron.launch({
    args: ['./out/main/index.js'],
    env: { ...process.env, APPDATA: temporaryDirectory, XDG_CONFIG_HOME: temporaryDirectory },
  });

  try {
    const userData = await application.evaluate(({ app }) => app.getPath('userData'));
    expect(userData.toLowerCase()).toContain(temporaryDirectory.toLowerCase());

    const page = await application.firstWindow();
    await page.evaluate(() =>
      Promise.all(
        Array.from({ length: 30 }, (_, index) =>
          window.desktop.updateSettings({
            appearance: index % 2 ? 'solarized' : 'light',
            sidebarCollapsed: index % 2 === 1,
          }),
        ),
      ),
    );

    const saved = await page.evaluate(() => window.desktop.getSettings());
    expect(saved).toMatchObject({ appearance: 'solarized', sidebarCollapsed: true });
    expect(
      JSON.parse(await readFile(join(userData, 'app', 'settings.json'), 'utf8')),
    ).toMatchObject({
      appearance: 'solarized',
      sidebarCollapsed: true,
    });
  } finally {
    await application.close();
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
