import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopApi } from '../shared/api';
import type { CommandId } from '../shared/commands';

const desktop: DesktopApi = {
  platform: process.platform,
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings) => ipcRenderer.invoke('settings:update', settings),
  selectFolder: () => ipcRenderer.invoke('folder:select'),
  onCommand: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, id: CommandId): void => callback(id);
    ipcRenderer.on('command:execute', listener);
    return () => ipcRenderer.removeListener('command:execute', listener);
  },
  onWorkspace: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, path: string): void => callback(path);
    ipcRenderer.on('workspace:open', listener);
    return () => ipcRenderer.removeListener('workspace:open', listener);
  },
};

contextBridge.exposeInMainWorld('desktop', desktop);
