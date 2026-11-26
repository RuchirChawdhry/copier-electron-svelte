import { chromium, expect, test } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

test('workspace tabs, command search and pinned actions work', async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_BIN || undefined,
    headless: true,
    // Chromium blocks file:// module imports unless local file access is enabled.
    args: ['--no-sandbox', '--allow-file-access-from-files'],
  });

  try {
    const page = await browser.newPage();
    page.on('pageerror', (error) => console.error('Renderer error:', error));
    page.on('console', (message) => {
      if (message.type() === 'error') console.error('Renderer console:', message.text());
    });
    await page.addInitScript(() => {
      let settings = {
        appearance: 'dark' as const,
        sidebarCollapsed: false,
        pinnedCommands: ['tab.new', 'folder.open', 'settings.open'],
        pinnedTabs: [],
        recentFolders: [] as string[],
      };
      Object.defineProperty(window, 'desktop', {
        value: {
          platform: 'linux',
          getSettings: async () => settings,
          updateSettings: async (change: object) => (settings = { ...settings, ...change }),
          setTitlebarTheme: () => undefined,
          selectFolder: async () => '/tmp/example-project',
          onCommand: () => () => undefined,
          onWorkspace: () => () => undefined,
        },
      });
    });
    await page.goto(pathToFileURL(resolve('out/renderer/index.html')).toString());

    await expect(page.getByRole('tab', { name: 'Workspace' })).toBeVisible();
    await expect(page.locator('.titlebar > .command-search + .pinned-actions')).toBeVisible();
    await expect(
      page.locator('.pinned-actions').getByRole('button', { name: 'New workspace tab' }),
    ).toBeVisible();
    await page.locator('.workspace-main').click({
      button: 'right',
      position: { x: 520, y: 190 },
    });
    const workspaceMenu = page.getByTestId('workspace-context-menu');
    await expect(workspaceMenu).toBeVisible();
    await expect(workspaceMenu.getByRole('menuitem')).toHaveCount(6);
    await workspaceMenu.getByRole('menuitem', { name: /Open command launcher/ }).click();
    await expect(page.getByPlaceholder('Search commands and actions…')).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'New tab', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Workspace' })).toHaveCount(2);

    await page.getByRole('tab', { name: 'Workspace' }).first().click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Pin tab' }).click();
    await expect(page.locator('.tab-container.pinned')).toHaveCount(1);
    await page.keyboard.press('Control+2');
    await expect(page.getByRole('tab', { name: 'Workspace' }).last()).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await page.getByRole('button', { name: 'Search commands' }).click();
    const search = page.getByPlaceholder('Search commands and actions…');
    await expect(search).toBeVisible();
    await search.fill('settings');
    await page.getByRole('option', { name: /Open settings/ }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await page.getByRole('button', { name: 'Solarized' }).click();
    await expect(page.locator('html')).toHaveClass(/solarized/);
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('.workspace-main')).toHaveCSS('background-color', 'rgb(0, 43, 54)');
    await expect(page.locator('.workspace-main')).toHaveCSS('color', 'rgb(147, 161, 161)');
    await expect(page.locator('.workspace-sidebar')).toHaveCSS(
      'background-color',
      'rgb(7, 54, 66)',
    );
    const scrollbar = await page.locator('.workspace-main').evaluate((element) => ({
      width: getComputedStyle(element, '::-webkit-scrollbar').width,
      thumb: getComputedStyle(element, '::-webkit-scrollbar-thumb').backgroundColor,
      base: getComputedStyle(element).getPropertyValue('--scrollbar-thumb').trim(),
      hover: getComputedStyle(element).getPropertyValue('--scrollbar-thumb-hover').trim(),
    }));
    expect(scrollbar.width).toBe('11px');
    expect(scrollbar.base).toBe('#839496');
    expect(scrollbar.hover).toBe('#93a1a1');
    expect(['rgb(131, 148, 150)', 'rgb(147, 161, 161)']).toContain(scrollbar.thumb);

    const action = page.locator('.settings-action').filter({ hasText: 'Switch theme' });
    await action.getByRole('button', { name: 'Pin' }).click();
    await expect(page.getByRole('button', { name: 'Switch theme' })).toBeVisible();
    await page.getByRole('button', { name: 'Switch theme' }).click();
    await expect(page.locator('html')).not.toHaveClass(/solarized/);
  } finally {
    await browser.close();
  }
});
