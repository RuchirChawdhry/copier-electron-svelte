import type { CommandId } from './commands';

export type Appearance = 'dark' | 'light' | 'sepia';

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
