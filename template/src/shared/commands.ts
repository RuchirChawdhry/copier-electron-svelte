export const COMMANDS = [
  {
    id: 'tab.new',
    title: 'New workspace tab',
    description: 'Open another workspace',
    shortcut: 'Mod+T',
    icon: 'plus',
  },
  {
    id: 'tab.close',
    title: 'Close current tab',
    description: 'Close the active tab',
    shortcut: 'Mod+W',
    icon: 'x',
  },
  {
    id: 'folder.open',
    title: 'Open folder',
    description: 'Choose a directory from your computer',
    shortcut: 'Mod+O',
    icon: 'folder-open',
  },
  {
    id: 'settings.open',
    title: 'Open settings',
    description: 'Configure this application',
    shortcut: 'Mod+,',
    icon: 'settings',
  },
  {
    id: 'about.open',
    title: 'About this application',
    description: 'Application information',
    shortcut: '',
    icon: 'info',
  },
  {
    id: 'sidebar.toggle',
    title: 'Toggle sidebar',
    description: 'Show or hide workspace navigation',
    shortcut: 'Mod+B',
    icon: 'panel-left',
  },
  {
    id: 'theme.toggle',
    title: 'Switch theme',
    description: 'Toggle light and dark appearance',
    shortcut: '',
    icon: 'sun-moon',
  },
  {
    id: 'palette.open',
    title: 'Open command launcher',
    description: 'Search commands and actions',
    shortcut: 'Mod+K',
    icon: 'search',
  },
] as const;

export type CommandId = (typeof COMMANDS)[number]['id'];
export type IconName = (typeof COMMANDS)[number]['icon'];

export const JUMP_LIST_COMMANDS = [
  'tab.new',
  'folder.open',
  'settings.open',
] as const satisfies readonly CommandId[];

export function isCommandId(value: string): value is CommandId {
  return COMMANDS.some((command) => command.id === value);
}
