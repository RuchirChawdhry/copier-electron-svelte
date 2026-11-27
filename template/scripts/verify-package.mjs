import { existsSync, globSync } from 'node:fs';
import { listPackage } from '@electron/asar';

const archives =
  process.platform === 'win32'
    ? ['dist/win-unpacked/resources/app.asar']
    : process.platform === 'darwin'
      ? globSync('dist/mac*/*.app/Contents/Resources/app.asar')
      : ['dist/linux-unpacked/resources/app.asar'];
const archive = archives.find(existsSync);
if (!archive) throw new Error('Production app.asar is missing. Run task build first.');

const files = listPackage(archive).map((path) => path.replaceAll('\\', '/').replace(/^\/+/, ''));
const required = ['out/main/index.js', 'out/preload/index.js', 'out/renderer/index.html'];
const missing = required.filter((path) => !files.includes(path));
const excluded = files.filter((path) =>
  /^(src|tests|scripts|\.github|\.vscode|node_modules\/(?:@electron\/asar|electron-vite|vite|vitest|eslint|prettier|playwright|typescript))(?:\/|$)|\.map$|^Taskfile\.yml$/.test(
    path,
  ),
);

if (missing.length || excluded.length) {
  throw new Error(
    `Invalid production package. Missing: ${missing.join(', ') || 'none'}; development files: ${excluded.join(', ') || 'none'}`,
  );
}
console.log(`Verified ${archive}: app bundles present; no development files in app.asar.`);
