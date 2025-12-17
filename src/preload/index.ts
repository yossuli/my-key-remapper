import { contextBridge, ipcRenderer } from "electron";

// リスナーのラッパー関数を管理するMap
// biome-ignore lint/suspicious/noExplicitAny: IPC引数は動的です
const listenerMap = new Map<
  (...args: any[]) => void,
  (...args: any[]) => void
>();

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    // biome-ignore lint/suspicious/noExplicitAny: IPC引数は動的です
    on: (channel: string, func: (...args: any[]) => void) => {
      // biome-ignore lint/suspicious/noExplicitAny: IPCイベントは型が緩いです
      const subscription = (_event: any, ...args: any[]) =>
        func(_event, ...args);
      listenerMap.set(func, subscription);
      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
        listenerMap.delete(func);
      };
    },
    // biome-ignore lint/suspicious/noExplicitAny: IPC引数は動的です
    off: (channel: string, func: (...args: any[]) => void) => {
      const subscription = listenerMap.get(func);
      if (subscription) {
        ipcRenderer.removeListener(channel, subscription);
        listenerMap.delete(func);
      }
    },
    // biome-ignore lint/suspicious/noExplicitAny: IPC引数は動的です
    send: (channel: string, ...args: any[]) =>
      ipcRenderer.send(channel, ...args),
    // biome-ignore lint/suspicious/noExplicitAny: IPC引数は動的です
    invoke: (channel: string, ...args: any[]) =>
      ipcRenderer.invoke(channel, ...args),
  },
});
