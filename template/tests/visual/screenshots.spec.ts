import { _electron as electron, expect, test } from '@playwright/test';
import { execFile } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { makeWindowScreenshotOpaque } from './normalize-screenshot';

const execFileAsync = promisify(execFile);
const screenshotDir = resolve('screenshots');

test.skip(process.platform !== 'win32', 'WinApp CLI screenshots require Windows');

test('captures the workspace, command launcher, tabs, settings, themes, and about', async () => {
  const application = await electron.launch({ args: ['./out/main/index.js'] });

  try {
    const page = await application.firstWindow();
    await expect(page.getByRole('tab', { name: 'Workspace' })).toBeVisible();

    await application.evaluate(({ BrowserWindow }) => {
      BrowserWindow.getAllWindows()[0].setSize(1280, 800);
    });
    const hwnd = await application.evaluate(({ BrowserWindow }) => {
      const handle = BrowserWindow.getAllWindows()[0].getNativeWindowHandle();
      return handle.readBigUInt64LE(0).toString();
    });

    await mkdir(screenshotDir, { recursive: true });

    async function capture(filename: string): Promise<void> {
      await page.waitForTimeout(300);
      const file = resolve(screenshotDir, filename);
      const args = ['ui', 'screenshot', '-w', hwnd, '--output', file, '--json'];
      const firstCapture = await execFileAsync('winapp', [...args, '--focus'], {
        timeout: 30_000,
      });
      if (/\bblack\b/i.test(firstCapture.stderr)) {
        // WGC can report an all-black frame; retry using WinApp's screen mode.
        const retry = await execFileAsync('winapp', [...args, '--capture-screen'], {
          timeout: 30_000,
        });
        if (/\bblack\b/i.test(retry.stderr)) {
          throw new Error(`WinApp captured an all-black image for ${filename}`);
        }
      }

      // A successful CLI exit without an actual PNG is not a successful capture.
      const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
      const contents = await readFile(file);
      expect(contents.subarray(0, 8).equals(pngSignature)).toBe(true);
      // WinApp's DWM capture includes transparent shadows; crop them and make
      // the remaining rounded corners opaque while preserving window content.
      await writeFile(file, makeWindowScreenshotOpaque(contents));
      expect((await stat(file)).size).toBeGreaterThan(1_000);
      await test.info().attach(filename, { path: file, contentType: 'image/png' });
    }

    await capture('01-workspace-dark.png');

    await page.getByRole('button', { name: 'Search commands' }).click();
    await expect(page.getByPlaceholder('Search commands and actions…')).toBeVisible();
    await capture('02-command-launcher.png');
    await page.keyboard.press('Escape');
    await expect(page.getByPlaceholder('Search commands and actions…')).toBeHidden();

    await page.getByRole('button', { name: 'New tab', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Workspace' })).toHaveCount(2);
    await page.getByRole('tab', { name: 'Workspace' }).first().click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Pin tab' }).click();
    await expect(page.locator('.tab-container.pinned')).toHaveCount(1);
    await capture('03-pinned-tabs.png');

    await page.locator('.workspace-sidebar').getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await capture('04-settings-dark.png');

    await page.getByRole('button', { name: 'Light' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark|solarized/);
    await capture('05-settings-light.png');

    await page.getByRole('button', { name: 'Solarized' }).click();
    await expect(page.locator('html')).toHaveClass(/solarized/);
    await capture('06-settings-solarized.png');

    await page.getByRole('button', { name: 'About' }).click();
    await expect(page.getByRole('heading', { name: /^About / })).toBeVisible();
    await capture('07-about-solarized.png');
  } finally {
    await application.close();
  }
});
