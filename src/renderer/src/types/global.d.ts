// ElectronのIPC通信用グローバル型定義
declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        // チャンネルによってIPC引数が大きく異なるため、ここでは柔軟性のために 'any' が必要です。
        // biome-ignore lint/suspicious/noExplicitAny: IPC引数は動的です
        on: (channel: string, func: (...args: any[]) => void) => void;
        // biome-ignore lint/suspicious/noExplicitAny: IPC引数は動的です
        off: (channel: string, func: (...args: any[]) => void) => void;
        // biome-ignore lint/suspicious/noExplicitAny: IPC引数は動的です
        send: (channel: string, ...args: any[]) => void;
        // biome-ignore lint/suspicious/noExplicitAny: IPC戻り値は動的です
        invoke: (channel: string, ...args: any[]) => Promise<any>;
      };
    };
  }
}

export {};
