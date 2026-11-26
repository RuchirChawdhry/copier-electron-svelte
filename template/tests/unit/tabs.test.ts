import { describe, expect, it } from 'vitest';
import { MAX_PINNED_TABS, DEFAULT_SETTINGS } from '../../src/shared/settings';
import { tabIndexForShortcut } from '../../src/shared/tabs';

describe('tab keyboard navigation', () => {
  it('selects visible tab positions 1 through 8', () => {
    expect(tabIndexForShortcut('1', 5)).toBe(0);
    expect(tabIndexForShortcut('5', 5)).toBe(4);
    expect(tabIndexForShortcut('6', 5)).toBeNull();
  });

  it('uses Ctrl/Cmd+9 for the final tab, even with fewer than nine', () => {
    expect(tabIndexForShortcut('9', 3)).toBe(2);
    expect(tabIndexForShortcut('9', 10)).toBe(9);
    expect(tabIndexForShortcut('9', 0)).toBeNull();
  });

  it('ignores other keys', () => {
    expect(tabIndexForShortcut('0', 4)).toBeNull();
    expect(tabIndexForShortcut('k', 4)).toBeNull();
  });
});

describe('shell defaults', () => {
  it('starts dark and limits pinned tabs to three', () => {
    expect(DEFAULT_SETTINGS.appearance).toBe('dark');
    expect(DEFAULT_SETTINGS.pinnedTabs).toEqual([]);
    expect(MAX_PINNED_TABS).toBe(3);
  });
});
