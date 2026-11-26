import { _electron as electron, expect, test } from '@playwright/test';

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

    await page.getByRole('button', { name: 'New tab' }).click();
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
