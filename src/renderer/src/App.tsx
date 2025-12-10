import { AlertCircle, Keyboard, Power, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { KeyEditorModal, SimpleKeyboard } from "./components/simpleKeyboard";
import { KEYBOARD_LAYOUT, SWITCH_LAYOUT_RULE } from "./constants";
import type { LayoutType } from "./types";

interface LogEntry {
  id: string;
  vkCode: number;
  time: string;
}

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

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [mappings, setMappings] = useState<[number, number][]>([]);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [layout, setLayout] = useState<LayoutType>("US");

  const keyboardLayout = useMemo(() => KEYBOARD_LAYOUT[layout], [layout]);

  const tggleLayout = () => {
    setLayout((prev) => SWITCH_LAYOUT_RULE[prev]);
  };

  const MAX_LOG_ENTRIES = 19;
  const mappingsMap = new Map(mappings);

  useEffect(() => {
    // Listen for key events
    const handleKeyEvent = (_event: unknown, data: { vkCode: number }) => {
      setLogs((prev) => [
        {
          id: crypto.randomUUID(),
          vkCode: data.vkCode,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, MAX_LOG_ENTRIES),
      ]);
    };

    const ipc = window.electron?.ipcRenderer;
    if (ipc) {
      ipc.on("key-event", handleKeyEvent);
      // Load initial mappings
      ipc.invoke("get-mappings").then((initial: [number, number][]) => {
        setMappings(initial);
      });
    }

    return () => {
      if (ipc) {
        ipc.off("key-event", handleKeyEvent);
      }
    };
  }, []);

  const saveMapping = (from: number, to: number) => {
    const ipc = window.electron?.ipcRenderer;
    ipc?.send("add-mapping", { from, to });
    // Optimistic update
    setMappings((prev) => {
      const newMap = new Map(prev);
      newMap.set(from, to);
      return Array.from(newMap.entries());
    });
  };

  const removeMapping = (from: number) => {
    const ipc = window.electron?.ipcRenderer;
    ipc?.send("remove-mapping", from);
    setMappings((prev) => prev.filter((m) => m[0] !== from));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-6 font-sans text-foreground">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Keyboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">Key Remapper</h1>
            <p className="text-muted-foreground text-xs">Windows Native Hook</p>
          </div>
        </div>

        <button
          className={`flex items-center gap-2 rounded-full px-4 py-2 font-medium text-sm transition-colors ${
            isActive
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          }`}
          onClick={() => setIsActive(!isActive)}
          type="button"
        >
          <Power className="h-4 w-4" />
          {isActive ? "Active" : "Disabled"}
        </button>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-lg">
              <Settings className="h-5 w-5 opacity-70" />
              Keyboard Layout: {layout}
            </h2>
            <button
              className="flex items-center gap-2 rounded-full border px-4 py-2 font-medium text-sm transition-colors hover:border hover:border-primary"
              onClick={tggleLayout}
              type="button"
            >
              <Keyboard className="h-4 w-4" />
              {SWITCH_LAYOUT_RULE[layout]}
            </button>
          </div>
          <div className="overflow-x-auto pb-4">
            <SimpleKeyboard
              keyboardLayout={keyboardLayout}
              mappings={mappingsMap}
              onKeyClick={(vk) => setEditingKey(vk)}
            />
          </div>
        </section>

        <section className="flex h-fit flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b bg-muted/30 p-4">
            <AlertCircle className="h-4 w-4 text-accent-foreground" />
            <h2 className="font-semibold text-sm">Live Event Log</h2>
          </div>
          <div className="max-h-[400px] flex-1 space-y-2 overflow-y-auto p-4 font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-xs italic">
                Waiting for input...
              </p>
            ) : (
              logs.map((log) => (
                <div
                  className="fade-in slide-in-from-left-2 flex animate-in items-center justify-between duration-200"
                  key={log.id}
                >
                  <span className="rounded bg-accent/50 px-2 py-0.5 text-accent-foreground">
                    VK: {log.vkCode}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {log.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <KeyEditorModal
        isOpen={editingKey !== null}
        keyboardLayout={keyboardLayout}
        mappings={mappingsMap}
        onClose={() => setEditingKey(null)}
        onRemove={removeMapping}
        onSave={saveMapping}
        targetVk={editingKey}
      />
    </div>
  );
}
