import { win32 } from 'node:path';
import { COMMANDS, JUMP_LIST_COMMANDS } from '../shared/commands';
import { MAX_PINNED_TABS, type AppSettings } from '../shared/settings';

// Zero-based icons in Windows' built-in shell32.dll: document, open folder,
// search, Control Panel/settings, and help. No bundled icon assets are needed.
const TASK_ICON_INDICES = {
  'tab.new': 1,
  'folder.open': 4,
  'palette.open': 22,
  'settings.open': 35,
  'about.open': 23,
} satisfies Record<(typeof JUMP_LIST_COMMANDS)[number], number>;

interface JumpListOptions {
  executable: string;
  shellIcons: string;
  explorer: string;
  settings: Pick<AppSettings, 'pinnedTabs' | 'recentFolders'>;
  removedItems: Electron.JumpListItem[];
}

export function buildJumpList({
  executable,
  shellIcons,
  explorer,
  settings,
  removedItems,
}: JumpListOptions): Electron.JumpListCategory[] {
  const removedArgs = new Set(removedItems.map((item) => item.args));
  const workspaceItem = (
    folder: string,
    title = win32.basename(folder),
  ): Electron.JumpListItem => ({
    type: 'task',
    program: executable,
    args: `--folder64=${Buffer.from(folder).toString('base64url')}`,
    title: title.slice(0, 255),
    description: folder.slice(0, 255),
    // VS Code uses Explorer's native icon for workspace entries too.
    iconPath: explorer,
    iconIndex: 0,
  });

  const pinned = settings.pinnedTabs
    .flatMap((tab) =>
      tab.kind === 'workspace' && tab.folder ? [workspaceItem(tab.folder, tab.title)] : [],
    )
    .slice(0, MAX_PINNED_TABS)
    .filter((item) => !removedArgs.has(item.args));
  const pinnedPaths = new Set(pinned.map((item) => item.args));
  const recent = settings.recentFolders
    .map((folder) => workspaceItem(folder))
    .filter((item) => !pinnedPaths.has(item.args) && !removedArgs.has(item.args))
    .slice(0, 6);

  const tasks: Electron.JumpListItem[] = JUMP_LIST_COMMANDS.flatMap((id) => {
    const command = COMMANDS.find((entry) => entry.id === id)!;
    const task: Electron.JumpListItem = {
      type: 'task',
      program: executable,
      args: `--command=${id}`,
      title: command.title,
      description: command.description,
      iconPath: shellIcons,
      iconIndex: TASK_ICON_INDICES[id],
    };
    return id === 'settings.open' ? [{ type: 'separator' as const }, task] : [task];
  });

  return [
    ...(pinned.length
      ? [{ type: 'custom' as const, name: 'Pinned Workspaces', items: pinned }]
      : []),
    ...(recent.length
      ? [{ type: 'custom' as const, name: 'Recent Workspaces', items: recent }]
      : []),
    { type: 'tasks', items: tasks },
  ];
}
