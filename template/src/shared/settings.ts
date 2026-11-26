import type { CommandId } from './commands';

export const APPEARANCES = ['dark', 'light', 'solarized'] as const;
export type Appearance = (typeof APPEARANCES)[number];

export interface PinnedTab {
  id: string;
  title: string;
  kind: 'workspace' | 'settings' | 'about';
  folder?: string;
}

export const MAX_PINNED_TABS = 3;

export interface AppSettings {
  appearance: Appearance;
  sidebarCollapsed: boolean;
  pinnedCommands: CommandId[];
  pinnedTabs: PinnedTab[];
  recentFolders: string[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  appearance: 'dark',
  sidebarCollapsed: false,
  pinnedCommands: ['tab.new', 'folder.open', 'settings.open'],
  pinnedTabs: [],
  recentFolders: [],
};
