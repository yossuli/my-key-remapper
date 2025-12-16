import { AlertCircle, Keyboard, Power, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  Action,
  Layer,
  TriggerType,
} from "../../shared/types/remapConfig";
import { KeyEditorModal } from "./components/keyEditorModal";
import { SimpleKeyboard } from "./components/simpleKeyboard";
import { KEYBOARD_LAYOUT, SWITCH_LAYOUT_RULE } from "./constants";
import type { LayoutType } from "./types";
import { applyIf } from "./utils/appryIf";

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
  const [layers, setLayers] = useState<Layer[]>([]);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [layout, setLayout] = useState<LayoutType>("JIS");
  const [layerId, setLayerId] = useState<Layer["id"]>("base");

  const keyboardLayout = useMemo(
    () => KEYBOARD_LAYOUT[layerId === "base" ? "base" : "custom"][layout],
    [layerId, layout]
  );

  const toggleLayout = () => {
    setLayout((prev) => SWITCH_LAYOUT_RULE[prev]);
  };

  const MAX_LOG_ENTRIES = 19;

  useEffect(() => {
    // キーイベントを受信
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
      // 初期マッピングを読み込む
      ipc.invoke("get-mappings").then((initial: Layer[]) => {
        setLayers(initial);
        console.log(initial);
      });
    }

    return () => {
      if (ipc) {
        ipc.off("key-event", handleKeyEvent);
      }
    };
  }, []);

  const saveMapping = (from: number, trigger: TriggerType, action: Action) => {
    const ipc = window.electron?.ipcRenderer;
    ipc?.send("add-mapping", { layerId, from, binding: { trigger, action } });
    // 楽観的更新（UIを先行更新）
    setLayers((prev) =>
      prev.map(
        applyIf(
          (l) => l.name !== layerId,
          (l) => ({
            ...l,
            bindings: {
              ...l.bindings,
              [from]: l.bindings[from].filter(
                ({ action: a }) => a.type !== action.type
              ),
            },
          })
        )
      )
    );
  };

  const removeMapping = (from: number, trigger: TriggerType) => {
    const ipc = window.electron?.ipcRenderer;
    ipc?.send("remove-binding", { layerId, from, trigger });
    setLayers((prev) =>
      prev.map(
        applyIf(
          (l) => l.id !== layerId,
          (l) => {
            const filtered =
              l.bindings[from]?.filter((b) => b.trigger !== trigger) ?? [];
            if (filtered.length === 0) {
              const { [from]: _, ...newBindings } = l.bindings;
              return { ...l, bindings: newBindings };
            }
            return { ...l, bindings: { ...l.bindings, [from]: filtered } };
          }
        )
      )
    );
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
          {/* レイヤー選択UI */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Layer:</span>
            <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
              {layers.map(({ name }) => (
                <button
                  className={`rounded-md px-3 py-1.5 font-medium text-sm transition-colors ${
                    layerId === name
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  key={name}
                  onClick={() => setLayerId(name)}
                  type="button"
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-lg">
              <Settings className="h-5 w-5 opacity-70" />
              Keyboard Layout: {layout}
            </h2>
            <button
              className="flex items-center gap-2 rounded-full border px-4 py-2 font-medium text-sm transition-colors hover:border hover:border-primary"
              onClick={toggleLayout}
              type="button"
            >
              <Keyboard className="h-4 w-4" />
              {SWITCH_LAYOUT_RULE[layout]}
            </button>
          </div>
          <div className="overflow-x-auto pb-4">
            <SimpleKeyboard
              bindings={layers.find((l) => l.id === layerId)?.bindings || {}}
              keyboardLayout={keyboardLayout}
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
        currentBindings={
          editingKey !== null
            ? layers.find((l) => l.id === layerId)?.bindings[editingKey] || []
            : []
        }
        isOpen={editingKey !== null}
        keyboardLayout={keyboardLayout}
        layers={layers.map((l) => ({ id: l.id, name: l.name }))}
        onClose={() => setEditingKey(null)}
        onRemove={removeMapping}
        onSave={saveMapping}
        targetVk={editingKey}
      />
    </div>
  );
}
