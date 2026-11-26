import { chromium, expect, test } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

test('workspace tabs, command search and pinned actions work', async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_BIN || undefined,
    headless: true,
    args: ['--no-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      let settings = {
        appearance: 'dark' as const,
        sidebarCollapsed: false,
        pinnedCommands: ['tab.new', 'folder.open', 'settings.open'],
        recentFolders: [] as string[],
      };
      Object.defineProperty(window, 'desktop', {
        value: {
          platform: 'linux',
          getSettings: async () => settings,
          updateSettings: async (change: object) => (settings = { ...settings, ...change }),
          selectFolder: async () => '/tmp/example-project',
          onCommand: () => () => undefined,
        },
      });
    });
    await page.goto(pathToFileURL(resolve('out/renderer/index.html')).toString());

    await expect(page.getByRole('tab', { name: 'Workspace' })).toBeVisible();
    await page.getByRole('button', { name: 'New tab' }).click();
    await expect(page.getByRole('tab', { name: 'Workspace' })).toHaveCount(2);

    await page.getByRole('button', { name: 'Search commands' }).click();
    const search = page.getByPlaceholder('Search commands and actions…');
    await expect(search).toBeVisible();
    await search.fill('settings');
    await page.getByRole('option', { name: /Open settings/ }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    const action = page.locator('.settings-action').filter({ hasText: 'Switch theme' });
    await action.getByRole('button', { name: 'Pin' }).click();
    await expect(page.getByRole('button', { name: 'Switch theme' })).toBeVisible();
  } finally {
    await browser.close();
  }
});
