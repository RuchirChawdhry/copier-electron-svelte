import type { CommandId } from './commands';
import type { AppSettings, Appearance } from './settings';

export interface DesktopApi {
  platform: NodeJS.Platform;
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
  setTitlebarTheme(theme: Appearance): void;
  selectFolder(): Promise<string | null>;
  onCommand(callback: (id: CommandId) => void): () => void;
  onWorkspace(callback: (path: string) => void): () => void;
}
