import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  workers: 1,
  timeout: 240_000,
  use: { trace: 'retain-on-failure' },
  reporter: [['list'], ['junit', { outputFile: 'test-results/screenshots.xml' }]],
});
