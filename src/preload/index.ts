import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    // biome-ignore lint/suspicious/noExplicitAny: IPC引数は動的です
    on: (channel: string, func: (...args: any[]) => void) => {
      // biome-ignore lint/suspicious/noExplicitAny: IPCイベントは型が緩いです
      const subscription = (_event: any, ...args: any[]) =>
        func(_event, ...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    },
    // biome-ignore lint/suspicious/noExplicitAny: IPC引数は動的です
    off: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.removeListener(channel, func);
    },
    // biome-ignore lint/suspicious/noExplicitAny: IPC引数は動的です
    send: (channel: string, ...args: any[]) =>
      ipcRenderer.send(channel, ...args),
    // biome-ignore lint/suspicious/noExplicitAny: IPC引数は動的です
    invoke: (channel: string, ...args: any[]) =>
      ipcRenderer.invoke(channel, ...args),
  },
});
