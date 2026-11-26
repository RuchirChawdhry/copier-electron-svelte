import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getSettings, updateSettings } from '../../src/main/settings';

vi.mock('electron', () => ({
  app: { getPath: () => process.env.COPIER_SETTINGS_TEST_DIR },
}));

let directory: string;

beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), 'copier-settings-'));
  process.env.COPIER_SETTINGS_TEST_DIR = directory;
});

afterAll(async () => {
  delete process.env.COPIER_SETTINGS_TEST_DIR;
  await rm(directory, { recursive: true, force: true });
});

test('concurrent updates preserve the latest settings on disk', async () => {
  await Promise.all(
    Array.from({ length: 30 }, (_, index) =>
      updateSettings({
        appearance: index % 2 ? 'solarized' : 'light',
        sidebarCollapsed: index % 2 === 1,
      }),
    ),
  );

  expect(await getSettings()).toMatchObject({ appearance: 'solarized', sidebarCollapsed: true });
  expect(JSON.parse(await readFile(join(directory, 'app', 'settings.json'), 'utf8'))).toMatchObject(
    {
      appearance: 'solarized',
      sidebarCollapsed: true,
    },
  );
});
