import type { CommandId } from './commands';
import type { AppSettings } from './settings';

export interface DesktopApi {
  platform: NodeJS.Platform;
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
  selectFolder(): Promise<string | null>;
  onCommand(callback: (id: CommandId) => void): () => void;
  onWorkspace(callback: (path: string) => void): () => void;
}
