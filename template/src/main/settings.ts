import { app } from 'electron';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { isCommandId } from '../shared/commands';
import {
  APPEARANCES,
  DEFAULT_SETTINGS,
  MAX_PINNED_TABS,
  type AppSettings,
  type PinnedTab,
} from '../shared/settings';

let settings: AppSettings | undefined;
let settingsLoading: Promise<AppSettings> | undefined;
let writing = false;
const pending: {
  change: Partial<AppSettings>;
  resolve: (saved: AppSettings) => void;
  reject: (error: unknown) => void;
}[] = [];

function settingsPath(): string {
  return join(app.getPath('userData'), 'app', 'settings.json');
}

function mergeSettings(value: Partial<AppSettings>): AppSettings {
  const appearance =
    APPEARANCES.find((option) => option === value.appearance) ?? DEFAULT_SETTINGS.appearance;

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
    pinnedTabs: Array.isArray(value.pinnedTabs)
      ? value.pinnedTabs
          .filter(
            (tab): tab is PinnedTab =>
              typeof tab?.id === 'string' &&
              typeof tab.title === 'string' &&
              ['workspace', 'settings', 'about'].includes(tab.kind) &&
              (tab.folder === undefined || typeof tab.folder === 'string'),
          )
          .slice(0, MAX_PINNED_TABS)
      : [],
    recentFolders: Array.isArray(value.recentFolders)
      ? [
          ...new Set(
            value.recentFolders.filter((path) => typeof path === 'string' && path.length > 0),
          ),
        ].slice(0, 6)
      : DEFAULT_SETTINGS.recentFolders,
  };
}

async function loadSettings(): Promise<AppSettings> {
  try {
    settings = mergeSettings(
      JSON.parse(await readFile(settingsPath(), 'utf8')) as Partial<AppSettings>,
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    settings = {
      ...DEFAULT_SETTINGS,
      pinnedCommands: [...DEFAULT_SETTINGS.pinnedCommands],
      pinnedTabs: [],
      recentFolders: [],
    };
  }
  return settings;
}

export function getSettings(): Promise<AppSettings> {
  return settings ? Promise.resolve(settings) : (settingsLoading ??= loadSettings());
}

async function flushSettings(): Promise<void> {
  if (writing) return;
  writing = true;

  try {
    let current = await getSettings();
    const destination = settingsPath();
    await mkdir(join(app.getPath('userData'), 'app'), { recursive: true });

    while (pending.length) {
      const batch = pending.splice(0);
      const next = batch.reduce(
        (state, { change }) => mergeSettings({ ...state, ...change }),
        current,
      );
      try {
        await writeFile(`${destination}.tmp`, JSON.stringify(next, null, 2), 'utf8');
        await rename(`${destination}.tmp`, destination);
        current = next;
        settings = next;
        for (const request of batch) request.resolve(next);
      } catch (error) {
        for (const request of batch) request.reject(error);
      }
    }
  } catch (error) {
    for (const request of pending.splice(0)) request.reject(error);
  } finally {
    writing = false;
    if (pending.length) void flushSettings();
  }
}

export function updateSettings(change: Partial<AppSettings>): Promise<AppSettings> {
  return new Promise((resolve, reject) => {
    pending.push({ change, resolve, reject });
    void flushSettings();
  });
}
