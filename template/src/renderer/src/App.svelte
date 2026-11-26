<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Check,
    ChevronRight,
    FolderOpen,
    Info,
    LayoutDashboard,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    Settings,
    Sparkles,
  } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';
  import { COMMANDS, type CommandId } from '../../shared/commands';
  import { APP_NAME } from '../../shared/brand';
  import { tabIndexForShortcut } from '../../shared/tabs';
  import {
    APPEARANCES,
    DEFAULT_SETTINGS,
    MAX_PINNED_TABS,
    type AppSettings,
    type Appearance,
    type PinnedTab,
  } from '../../shared/settings';
  import Titlebar from '$lib/components/shell/Titlebar.svelte';
  import CommandLauncher from '$lib/components/shell/CommandLauncher.svelte';
  import ActionIcon from '$lib/components/shell/ActionIcon.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Toaster } from '$lib/components/ui/sonner/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as ContextMenu from '$lib/components/ui/context-menu/index.js';

  type Tab = PinnedTab & { pinned: boolean };

  let tabs = $state<Tab[]>([{ id: 'home', title: 'Workspace', kind: 'workspace', pinned: false }]);
  let activeTabId = $state('home');
  let settings = $state<AppSettings>({
    ...DEFAULT_SETTINGS,
    pinnedCommands: [...DEFAULT_SETTINGS.pinnedCommands],
  });
  let paletteOpen = $state(false);
  let latestSettingsSave = 0;
  const activeTab = $derived(tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]);
  const dark = $derived(settings.appearance !== 'light');
  const contextMenuGroups = [
    ['tab.new', 'folder.open', 'palette.open'],
    ['sidebar.toggle', 'theme.toggle', 'settings.open'],
  ] as const satisfies readonly (readonly CommandId[])[];

  $effect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('solarized', settings.appearance === 'solarized');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    window.desktop.setTitlebarTheme(settings.appearance);
  });

  function createTab(kind: Tab['kind'] = 'workspace', folder?: string): void {
    const title =
      kind === 'settings'
        ? 'Settings'
        : kind === 'about'
          ? 'About'
          : folder
            ? folder.split(/[\\/]/).pop() || 'Workspace'
            : 'Workspace';
    const tab = {
      id: crypto.randomUUID(),
      title,
      kind,
      pinned: false,
      ...(folder ? { folder } : {}),
    };
    tabs = [...tabs, tab];
    activeTabId = tab.id;
  }

  function closeTab(id: string): void {
    const position = tabs.findIndex((tab) => tab.id === id);
    const wasPinned = tabs[position]?.pinned;
    tabs = tabs.filter((tab) => tab.id !== id);
    if (!tabs.length) {
      createTab();
    } else if (activeTabId === id) {
      activeTabId = tabs[Math.min(position, tabs.length - 1)].id;
    }
    if (wasPinned) savePinnedTabs();
  }

  function savePinnedTabs(): void {
    save({
      pinnedTabs: tabs
        .filter((tab) => tab.pinned)
        .map(({ id, title, kind, folder }) => ({ id, title, kind, ...(folder ? { folder } : {}) })),
    });
  }

  function toggleTabPin(id: string): void {
    const tab = tabs.find((item) => item.id === id);
    if (!tab) return;
    if (!tab.pinned && tabs.filter((item) => item.pinned).length >= MAX_PINNED_TABS) {
      toast.error(`You can pin up to ${MAX_PINNED_TABS} tabs.`);
      return;
    }
    tabs = tabs.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item));
    tabs = [...tabs.filter((item) => item.pinned), ...tabs.filter((item) => !item.pinned)];
    savePinnedTabs();
  }

  function reorderTab(source: string, target: string): void {
    const from = tabs.findIndex((tab) => tab.id === source);
    const to = tabs.findIndex((tab) => tab.id === target);
    if (from < 0 || to < 0 || from === to) return;
    if (tabs[from].pinned !== tabs[to].pinned) return;
    const wasPinned = tabs[from].pinned;
    const ordered = [...tabs];
    ordered.splice(to, 0, ...ordered.splice(from, 1));
    tabs = ordered;
    if (wasPinned) savePinnedTabs();
  }

  function save(change: Partial<AppSettings>): void {
    settings = { ...settings, ...change };
    const sequence = ++latestSettingsSave;
    void window.desktop
      .updateSettings(change)
      .then((saved) => {
        if (sequence === latestSettingsSave) settings = saved;
      })
      .catch((error) => toast.error(`Could not save settings: ${error}`));
  }

  function togglePin(id: CommandId): void {
    save({
      pinnedCommands: settings.pinnedCommands.includes(id)
        ? settings.pinnedCommands.filter((pinned) => pinned !== id)
        : [...settings.pinnedCommands, id].slice(0, 8),
    });
  }

  function run(id: CommandId): void {
    switch (id) {
      case 'tab.new':
        createTab();
        break;
      case 'tab.close':
        closeTab(activeTabId);
        break;
      case 'settings.open':
        createTab('settings');
        break;
      case 'about.open':
        createTab('about');
        break;
      case 'palette.open':
        paletteOpen = true;
        break;
      case 'sidebar.toggle':
        save({ sidebarCollapsed: !settings.sidebarCollapsed });
        break;
      case 'theme.toggle':
        save({
          appearance: (
            { dark: 'light', light: 'solarized', solarized: 'dark' } satisfies Record<
              Appearance,
              Appearance
            >
          )[settings.appearance],
        });
        break;
      case 'folder.open':
        void window.desktop.selectFolder().then((folder) => {
          if (folder) {
            createTab('workspace', folder);
            void window.desktop.getSettings().then((saved) => {
              settings = saved;
            });
          }
        });
        break;
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
    const key = event.key.toLowerCase();
    const tabIndex = tabIndexForShortcut(key, tabs.length);
    if (tabIndex !== null) {
      const target = tabs[tabIndex];
      if (target) {
        event.preventDefault();
        activeTabId = target.id;
      }
      return;
    }
    const id = (
      {
        k: 'palette.open',
        t: 'tab.new',
        w: 'tab.close',
        o: 'folder.open',
        b: 'sidebar.toggle',
        ',': 'settings.open',
      } as Record<string, CommandId>
    )[key];
    if (id) {
      event.preventDefault();
      run(id);
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    const unsubscribe = window.desktop.onCommand(run);
    const unsubscribeWorkspace = window.desktop.onWorkspace((path) => createTab('workspace', path));
    void window.desktop
      .getSettings()
      .then((saved) => {
        settings = saved;
        const pinned = saved.pinnedTabs.map((tab) => ({ ...tab, pinned: true }));
        tabs = [...pinned, ...tabs.filter((tab) => !pinned.some((item) => item.id === tab.id))];
      })
      .catch((error) => toast.error(`Could not load settings: ${error}`));
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      unsubscribe();
      unsubscribeWorkspace();
    };
  });
</script>

<div class="app-shell">
  <Titlebar
    {tabs}
    {activeTabId}
    pinnedCommands={settings.pinnedCommands}
    onSelect={(id) => {
      activeTabId = id;
    }}
    onClose={closeTab}
    onReorder={reorderTab}
    onTogglePin={toggleTabPin}
    onRun={run}
    onUnpin={togglePin}
    onSearch={() => {
      paletteOpen = true;
    }}
    platform={window.desktop.platform}
  />

  <ContextMenu.Root>
    <ContextMenu.Trigger class="workspace-body">
      {#if !settings.sidebarCollapsed}
        <aside class="workspace-sidebar">
          <div class="sidebar-heading">
            <span>WORKSPACE</span><button
              aria-label="Hide sidebar"
              onclick={() => run('sidebar.toggle')}
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
          <button
            class:chosen={activeTab.kind === 'workspace'}
            class="sidebar-item"
            onclick={() => createTab()}
          >
            <LayoutDashboard size={15} /> Overview
          </button>
          <button
            class:chosen={activeTab.kind === 'settings'}
            class="sidebar-item"
            onclick={() => run('settings.open')}
          >
            <Settings size={15} /> Settings
          </button>
          <button
            class:chosen={activeTab.kind === 'about'}
            class="sidebar-item"
            onclick={() => run('about.open')}
          >
            <Info size={15} /> About
          </button>
          <div class="sidebar-filler"></div>
          <button class="sidebar-item" onclick={() => run('folder.open')}>
            <FolderOpen size={15} /> Open folder…
          </button>
        </aside>
      {:else}
        <aside class="sidebar-rail">
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Show sidebar"
            onclick={() => run('sidebar.toggle')}
          >
            <PanelLeftOpen size={17} />
          </Button>
        </aside>
      {/if}

      <main class="workspace-main" data-testid="workspace-main">
        {#if activeTab.kind === 'workspace'}
          <div class="page-head">
            <div>
              <div class="eyebrow">WORKSPACE</div>
              <h1>{activeTab.title}</h1>
              <p>Everything you need to start building is ready.</p>
            </div>
            <Badge variant="secondary"><Check size={13} class="mr-1" /> Ready</Badge>
          </div>
          {#if activeTab.folder}
            <div class="folder-location">
              <FolderOpen size={18} /><span title={activeTab.folder}>{activeTab.folder}</span>
            </div>
          {/if}
          <div class="feature-grid">
            <button class="feature-card" onclick={() => run('folder.open')}>
              <FolderOpen size={21} /><strong>Open folder</strong><span>
                Choose a local workspace
              </span><ChevronRight size={15} class="feature-chevron" />
            </button>
            <button class="feature-card" onclick={() => run('palette.open')}>
              <Sparkles size={21} /><strong>Command launcher</strong><span>
                Find commands with {window.desktop.platform === 'darwin' ? '⌘K' : 'Ctrl+K'}
              </span><ChevronRight size={15} class="feature-chevron" />
            </button>
            <button class="feature-card" onclick={() => run('tab.new')}>
              <Plus size={21} /><strong>New tab</strong><span>
                Open another workspace
              </span><ChevronRight size={15} class="feature-chevron" />
            </button>
          </div>
          {#if settings.recentFolders.length}
            <section class="page-section">
              <h2>Recent workspaces</h2>
              <p>These folders also appear in your Windows taskbar Jump List.</p>
              <div class="recent-folders">
                {#each settings.recentFolders as folder (folder)}
                  <button title={folder} onclick={() => createTab('workspace', folder)}>
                    <FolderOpen size={15} />
                    <span>{folder}</span>
                  </button>
                {/each}
              </div>
            </section>
          {/if}
          <section class="page-section">
            <h2>Title-bar actions</h2>
            <p>
              Pin frequently used commands from the launcher. Right-click a pinned button to remove
              it.
            </p>
            <div class="action-tags">
              {#each settings.pinnedCommands as id (id)}
                {@const command = COMMANDS.find((item) => item.id === id)}
                {#if command}
                  <span class="action-tag"><ActionIcon name={command.icon} />{command.title}</span>
                {/if}
              {/each}
            </div>
          </section>
        {:else if activeTab.kind === 'settings'}
          <div class="page-head">
            <div>
              <div class="eyebrow">PREFERENCES</div>
              <h1>Settings</h1>
              <p>Changes are saved automatically.</p>
            </div>
          </div>
          <section class="settings-section">
            <h2>Appearance</h2>
            <p>Dark by default, with light and the low-glare Solarized Dark palette.</p>
            <div class="setting-options">
              {#each APPEARANCES as appearance (appearance)}<Button
                  variant={settings.appearance === appearance ? 'default' : 'outline'}
                  size="sm"
                  onclick={() => save({ appearance: appearance as Appearance })}
                >
                  {appearance === 'solarized'
                    ? 'Solarized'
                    : appearance === 'dark'
                      ? 'Dark'
                      : 'Light'}
                </Button>{/each}
            </div>
          </section>
          <section class="settings-section">
            <h2>Pinned tabs</h2>
            <p>Right-click a tab to pin it. Up to three pinned tabs are restored on launch.</p>
            <p>Use Ctrl/Cmd+1 through 8 for numbered tabs and Ctrl/Cmd+9 for the last tab.</p>
          </section>
          <section class="settings-section">
            <h2>Title-bar commands</h2>
            <p>Pin up to eight commands. The selected buttons appear alongside your tabs.</p>
            <div class="settings-actions">
              {#each COMMANDS as command (command.id)}
                <div class="settings-action">
                  <ActionIcon name={command.icon} /><span>{command.title}</span><Button
                    size="sm"
                    variant={settings.pinnedCommands.includes(command.id) ? 'secondary' : 'outline'}
                    onclick={() => togglePin(command.id)}
                  >
                    {settings.pinnedCommands.includes(command.id) ? 'Unpin' : 'Pin'}
                  </Button>
                </div>
              {/each}
            </div>
          </section>
        {:else}
          <div class="page-head">
            <div>
              <div class="eyebrow">APPLICATION</div>
              <h1>About {APP_NAME}</h1>
              <p>Electron + Svelte 5 + TypeScript + shadcn-svelte.</p>
            </div>
          </div>
          <section class="page-section">
            <h2>Desktop-first foundation</h2>
            <p>
              Workspace tabs, title-bar commands, native folder selection, persistent preferences
              and Windows Jump List tasks are ready for extension.
            </p>
          </section>
        {/if}
      </main>
    </ContextMenu.Trigger>
    <ContextMenu.Content
      class="min-w-56 rounded-none"
      aria-label="Workspace actions"
      data-testid="workspace-context-menu"
    >
      <ContextMenu.Label>Workspace actions</ContextMenu.Label>
      {#each contextMenuGroups as group, index (index)}
        {#if index > 0}
          <ContextMenu.Separator />
        {/if}
        {#each group as id (id)}
          {@const command = COMMANDS.find((item) => item.id === id)}
          {#if command}
            <ContextMenu.Item onclick={() => run(id)}>
              <ActionIcon name={command.icon} />
              {command.title}
              {#if command.shortcut}
                <ContextMenu.Shortcut>
                  {command.shortcut.replace(
                    'Mod+',
                    window.desktop.platform === 'darwin' ? '⌘' : 'Ctrl+',
                  )}
                </ContextMenu.Shortcut>
              {/if}
            </ContextMenu.Item>
          {/if}
        {/each}
      {/each}
    </ContextMenu.Content>
  </ContextMenu.Root>

  <footer class="statusbar">
    <span class="status-indicator"></span><span>Ready</span>
    <div class="status-spacer"></div>
    <span>{tabs.length} {tabs.length === 1 ? 'tab' : 'tabs'}</span><span>·</span><span>
      {window.desktop.platform === 'darwin'
        ? 'macOS'
        : window.desktop.platform === 'win32'
          ? 'Windows'
          : 'Linux'}
    </span>
  </footer>
</div>

<CommandLauncher
  bind:open={paletteOpen}
  pinnedCommands={settings.pinnedCommands}
  onRun={run}
  onTogglePin={togglePin}
  platform={window.desktop.platform}
/>
<Toaster position="bottom-right" theme={dark ? 'dark' : 'light'} />
