import { describe, expect, it } from 'vitest';
import { buildJumpList } from '../../src/main/jump-list';
import { DEFAULT_SETTINGS } from '../../src/shared/settings';

const base = {
  executable: 'C:\\Apps\\Desktop\\desktop.exe',
  shellIcons: 'C:\\Windows\\System32\\shell32.dll',
  explorer: 'C:\\Windows\\explorer.exe',
  removedItems: [],
};

describe('Windows Jump List', () => {
  it('uses distinct built-in Windows icons and groups common tasks', () => {
    const categories = buildJumpList({ ...base, settings: DEFAULT_SETTINGS });
    expect(categories).toHaveLength(1);
    const tasks = categories[0].items!;
    expect(tasks.map((item) => item.type)).toEqual([
      'task',
      'task',
      'task',
      'separator',
      'task',
      'task',
    ]);
    expect(tasks.filter((item) => item.type === 'task').map((item) => item.iconIndex)).toEqual([
      1, 4, 22, 35, 23,
    ]);
    expect(
      tasks
        .filter((item) => item.type === 'task')
        .every((item) => item.iconPath === base.shellIcons),
    ).toBe(true);
  });

  it('displays pinned folders before recents without duplicates', () => {
    const categories = buildJumpList({
      ...base,
      settings: {
        pinnedTabs: [
          { id: 'one', title: 'My Project', kind: 'workspace', folder: 'C:\\Projects\\my-project' },
          { id: 'two', title: 'Settings', kind: 'settings' },
        ],
        recentFolders: ['C:\\Projects\\my-project', 'C:\\Projects\\second'],
      },
    });
    expect(categories.map((category) => category.name ?? category.type)).toEqual([
      'Pinned Workspaces',
      'Recent Workspaces',
      'tasks',
    ]);
    expect(categories[0].items?.[0].title).toBe('My Project');
    expect(categories[1].items?.[0].title).toBe('second');
    expect(categories[0].items?.[0].iconPath).toBe(base.explorer);
    expect(categories[1].items?.[0].args).toBe(
      `--folder64=${Buffer.from('C:\\Projects\\second').toString('base64url')}`,
    );
  });

  it('never re-adds removed workspace entries to a custom category', () => {
    const folder = 'C:\\Projects\\hidden';
    const encoded = Buffer.from(folder).toString('base64url');
    const categories = buildJumpList({
      ...base,
      settings: {
        pinnedTabs: [{ id: 'one', title: 'Hidden', kind: 'workspace', folder }],
        recentFolders: [folder, 'C:\\Projects\\visible'],
      },
      removedItems: [{ type: 'task', args: `--folder64=${encoded}` }],
    });
    expect(categories.map((category) => category.name ?? category.type)).toEqual([
      'Recent Workspaces',
      'tasks',
    ]);
    expect(categories[0].items?.map((item) => item.title)).toEqual(['visible']);
  });
});
