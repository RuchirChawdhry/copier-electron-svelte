<script lang="ts">
  import { Pin, PinOff } from '@lucide/svelte';
  import { COMMANDS, type CommandId } from '../../../../../shared/commands';
  import * as Command from '$lib/components/ui/command/index.js';
  import ActionIcon from './ActionIcon.svelte';

  let {
    open = $bindable(),
    pinnedCommands,
    onRun,
    onTogglePin,
    platform,
  }: {
    open: boolean;
    pinnedCommands: CommandId[];
    onRun: (id: CommandId) => void;
    onTogglePin: (id: CommandId) => void;
    platform: string;
  } = $props();

  const shortcut = (value: string): string =>
    value.replace('Mod', platform === 'darwin' ? '⌘' : 'Ctrl');
</script>

<Command.Dialog bind:open>
  <Command.Input placeholder="Search commands and actions…" />
  <Command.List>
    <Command.Empty>No matching commands.</Command.Empty>
    <Command.Group heading="Actions">
      {#each COMMANDS as command (command.id)}
        <Command.Item
          value={`${command.title} ${command.description}`}
          onSelect={() => {
            open = false;
            onRun(command.id);
          }}
        >
          <ActionIcon name={command.icon} />
          <span class="flex-1">{command.title}</span>
          {#if command.shortcut}<Command.Shortcut>
              {shortcut(command.shortcut)}
            </Command.Shortcut>{/if}
          <button
            class="ml-2 rounded p-1 text-muted-foreground hover:text-foreground"
            title={pinnedCommands.includes(command.id) ? 'Unpin action' : 'Pin to title bar'}
            aria-label={`${pinnedCommands.includes(command.id) ? 'Unpin' : 'Pin'} ${command.title}`}
            onclick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onTogglePin(command.id);
            }}
          >
            {#if pinnedCommands.includes(command.id)}<PinOff size={13} />{:else}<Pin
                size={13}
              />{/if}
          </button>
        </Command.Item>
      {/each}
    </Command.Group>
  </Command.List>
  <div class="border-t px-3 py-2 text-xs text-muted-foreground">
    Select to run · Pin actions to customize the title bar
  </div>
</Command.Dialog>
