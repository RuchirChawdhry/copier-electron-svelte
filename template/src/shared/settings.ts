import type { CommandId } from './commands';

export type Appearance = 'dark' | 'light' | 'system';

export interface AppSettings {
  appearance: Appearance;
  sidebarCollapsed: boolean;
  pinnedCommands: CommandId[];
  recentFolders: string[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  appearance: 'dark',
  sidebarCollapsed: false,
  pinnedCommands: ['tab.new', 'folder.open', 'settings.open'],
  recentFolders: [],
};
