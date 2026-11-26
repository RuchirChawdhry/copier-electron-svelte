import { app } from 'electron';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { isCommandId } from '../shared/commands';
import { DEFAULT_SETTINGS, type AppSettings, type Appearance } from '../shared/settings';

let settings: AppSettings | undefined;

function settingsPath(): string {
  return join(app.getPath('userData'), 'app', 'settings.json');
}

function mergeSettings(value: Partial<AppSettings>): AppSettings {
  const appearance: Appearance = ['dark', 'light', 'system'].includes(value.appearance ?? '')
    ? value.appearance!
    : DEFAULT_SETTINGS.appearance;

  return {
    appearance,
    sidebarCollapsed:
      typeof value.sidebarCollapsed === 'boolean'
        ? value.sidebarCollapsed
        : DEFAULT_SETTINGS.sidebarCollapsed,
    pinnedCommands: Array.isArray(value.pinnedCommands)
      ? [
          ...new Set(
            value.pinnedCommands.filter((id) => typeof id === 'string' && isCommandId(id)),
          ),
        ].slice(0, 8)
      : DEFAULT_SETTINGS.pinnedCommands,
    recentFolders: Array.isArray(value.recentFolders)
      ? [
          ...new Set(
            value.recentFolders.filter((path) => typeof path === 'string' && path.length > 0),
          ),
        ].slice(0, 6)
      : DEFAULT_SETTINGS.recentFolders,
  };
}

export async function getSettings(): Promise<AppSettings> {
  if (settings) return settings;
  try {
    settings = mergeSettings(
      JSON.parse(await readFile(settingsPath(), 'utf8')) as Partial<AppSettings>,
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    settings = {
      ...DEFAULT_SETTINGS,
      pinnedCommands: [...DEFAULT_SETTINGS.pinnedCommands],
      recentFolders: [],
    };
  }
  return settings;
}

export async function updateSettings(value: Partial<AppSettings>): Promise<AppSettings> {
  settings = mergeSettings({ ...(await getSettings()), ...value });
  const destination = settingsPath();
  await mkdir(join(app.getPath('userData'), 'app'), { recursive: true });
  await writeFile(`${destination}.tmp`, JSON.stringify(settings, null, 2), 'utf8');
  await rename(`${destination}.tmp`, destination);
  return settings;
}
