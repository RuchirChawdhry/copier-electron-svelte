import { describe, expect, it } from 'vitest';
import { COMMANDS, JUMP_LIST_COMMANDS, isCommandId } from '../../src/shared/commands';
import { DEFAULT_SETTINGS } from '../../src/shared/settings';

describe('shared command registry', () => {
  it('has unique command IDs', () => {
    expect(new Set(COMMANDS.map(({ id }) => id)).size).toBe(COMMANDS.length);
  });

  it('only publishes registered Jump List commands', () => {
    expect(JUMP_LIST_COMMANDS.every(isCommandId)).toBe(true);
  });

  it('uses valid default pinned commands', () => {
    expect(DEFAULT_SETTINGS.pinnedCommands.every(isCommandId)).toBe(true);
    expect(DEFAULT_SETTINGS.pinnedCommands.length).toBeLessThanOrEqual(8);
  });

  it('rejects unknown commands', () => {
    expect(isCommandId('app.delete-everything')).toBe(false);
  });
});
