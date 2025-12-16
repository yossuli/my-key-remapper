import { useEffect, useMemo, useState } from "react";
import type {
  Action,
  Layer,
  TriggerType,
} from "../../shared/types/remapConfig";
import { KeyEditorModal } from "./components/keyEditorModal";
import { Header } from "./components/template/Header";
import { KeyLogger } from "./components/template/KeyLogger";
import { KeyRemapView } from "./components/template/KeyRemapView";
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

const MAX_LOG_ENTRIES = 19;

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
      <Header
        isActive={isActive}
        onToggleActive={() => setIsActive(!isActive)}
      />

      <main className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        <KeyRemapView
          keyboardLayout={keyboardLayout}
          layerId={layerId}
          layers={layers}
          layout={layout}
          onKeyClick={(vk) => setEditingKey(vk)}
          onLayerChange={setLayerId}
          onLayoutToggle={toggleLayout}
        />

        <KeyLogger logs={logs} />
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
