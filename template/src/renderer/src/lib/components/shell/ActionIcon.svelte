<script lang="ts">
  import { FolderOpen, Info, PanelLeft, Plus, Search, Settings, SunMoon, X } from '@lucide/svelte';
  import type { IconName } from '../../../../../shared/commands';

  let { name, size = 15 }: { name: IconName; size?: number } = $props();
  const icons = {
    plus: Plus,
    x: X,
    'folder-open': FolderOpen,
    settings: Settings,
    info: Info,
    'panel-left': PanelLeft,
    'sun-moon': SunMoon,
    search: Search,
  };
  const Icon = $derived(icons[name]);
</script>

<Icon {size} strokeWidth={1.8} />
