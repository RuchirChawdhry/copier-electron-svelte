<script lang="ts">
  import { PinOff, Plus, Search, X } from '@lucide/svelte';
  import { COMMANDS, type CommandId } from '../../../../../shared/commands';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import ActionIcon from './ActionIcon.svelte';

  interface Tab {
    id: string;
    title: string;
    kind: 'workspace' | 'settings' | 'about';
  }

  let {
    tabs,
    activeTabId,
    pinnedCommands,
    onSelect,
    onClose,
    onReorder,
    onRun,
    onUnpin,
    onSearch,
    platform,
  }: {
    tabs: Tab[];
    activeTabId: string;
    pinnedCommands: CommandId[];
    onSelect: (id: string) => void;
    onClose: (id: string) => void;
    onReorder: (source: string, target: string) => void;
    onRun: (id: CommandId) => void;
    onUnpin: (id: CommandId) => void;
    onSearch: () => void;
    platform: string;
  } = $props();

  const mac = $derived(platform === 'darwin');
  let draggedTab = $state<string | null>(null);
  const pinned = $derived(
    pinnedCommands.flatMap((id) => COMMANDS.filter((command) => command.id === id)),
  );
</script>

<header class:mac class="titlebar" aria-label="Application title bar">
  <div class="brand" title="Application workspace"><span class="brand-mark">✦</span></div>
  <div class="tabstrip" role="tablist" aria-label="Open tabs">
    {#each tabs as tab (tab.id)}
      <ContextMenu.Root>
        <ContextMenu.Trigger class="tab-container">
          <div
            class:active={tab.id === activeTabId}
            class="title-tab"
            role="group"
            aria-label={`${tab.title} tab controls`}
            draggable="true"
            ondragstart={(event) => {
              draggedTab = tab.id;
              event.dataTransfer?.setData('text/plain', tab.id);
            }}
            ondragover={(event) => event.preventDefault()}
            ondrop={(event) => {
              event.preventDefault();
              if (draggedTab) onReorder(draggedTab, tab.id);
              draggedTab = null;
            }}
            ondragend={() => {
              draggedTab = null;
            }}
          >
            <button
              class="tab-label"
              role="tab"
              aria-selected={tab.id === activeTabId}
              onclick={() => onSelect(tab.id)}
            >
              {tab.title}
            </button>
            <button
              class="tab-close"
              aria-label={`Close ${tab.title}`}
              onclick={() => onClose(tab.id)}
            >
              <X size={12} />
            </button>
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Content class="rounded-none">
          <ContextMenu.Item onclick={() => onRun('tab.new')}>
            <Plus size={14} /> New tab
          </ContextMenu.Item>
          <ContextMenu.Item onclick={() => onClose(tab.id)}>
            <X size={14} /> Close tab
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    {/each}
  </div>

  <Button
    variant="ghost"
    size="icon-sm"
    class="no-drag shrink-0 rounded-none"
    aria-label="New tab"
    onclick={() => onRun('tab.new')}
  >
    <Plus size={16} />
  </Button>
  <div class="title-spacer"></div>

  <div class="pinned-actions" aria-label="Pinned commands">
    {#each pinned as command (command.id)}
      <ContextMenu.Root>
        <ContextMenu.Trigger class="no-drag">
          <Tooltip.Root>
            <Tooltip.Trigger
              class="pinned-button"
              onclick={() => onRun(command.id)}
              aria-label={command.title}
            >
              <ActionIcon name={command.icon} />
            </Tooltip.Trigger>
            <Tooltip.Content>{command.title}</Tooltip.Content>
          </Tooltip.Root>
        </ContextMenu.Trigger>
        <ContextMenu.Content class="rounded-none">
          <ContextMenu.Item onclick={() => onUnpin(command.id)}>
            <PinOff size={14} /> Unpin from title bar
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    {/each}
  </div>

  <button class="command-search no-drag" onclick={onSearch} aria-label="Search commands">
    <Search size={14} />
    <span>Search commands…</span>
    <kbd>{mac ? '⌘ K' : 'Ctrl K'}</kbd>
  </button>
</header>
