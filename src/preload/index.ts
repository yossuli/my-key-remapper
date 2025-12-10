import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  onKeyEvent: (callback: (event: any, value: any) => void) =>
    ipcRenderer.on("key-event", callback),
});
