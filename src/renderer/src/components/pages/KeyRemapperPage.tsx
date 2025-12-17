import { useEffect, useMemo, useState } from "react";
import {
  KEYBOARD_LAYOUT,
  SWITCH_LAYOUT_RULE,
} from "../../../../shared/constants";
import type {
  Action,
  Layer,
  TriggerType,
} from "../../../../shared/types/remapConfig";
import type { LayoutType } from "../../types";
import { remove, upsert } from "../../utils/handleMapping";
import { AppHeader } from "../organisms/AppHeader";
import { KeyEditorForm } from "../organisms/KeyEditorForm";
import { KeyRemapSection } from "../organisms/KeyRemapSection";
import { LogList } from "../organisms/LogList";
import { MainLayout } from "../template/MainLayout";
import { ModalLayout } from "../template/ModalLayout";

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

export function KeyRemapperPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [layout, setLayout] = useState<LayoutType>("JIS");
  const [layerId, setLayerId] = useState<Layer["id"]>("base");

  // カスタムレイヤーでもbaseと同じキーボードレイアウトを使用
  // KEYBOARD_LAYOUT_*_CUSTOMはvk=0のダミーレイアウトのため使用しない
  const keyboardLayout = useMemo(() => KEYBOARD_LAYOUT.base[layout], [layout]);

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
    setLayers(upsert(layerId, from, trigger, action));
  };

  const removeMapping = (from: number, trigger: TriggerType) => {
    const ipc = window.electron?.ipcRenderer;
    ipc?.send("remove-binding", { layerId, from, trigger });
    setLayers(remove(layerId, from, trigger));
  };

  const addLayer = (newLayerId: string) => {
    const ipc = window.electron?.ipcRenderer;
    ipc?.send("add-layer", { layerId: newLayerId });
    // 楽観的更新
    setLayers((prev) => [...prev, { id: newLayerId, bindings: {} }]);
  };

  const removeLayer = (targetLayerId: string) => {
    const ipc = window.electron?.ipcRenderer;
    ipc?.send("remove-layer", { layerId: targetLayerId });
    // 楽観的更新
    setLayers((prev) => prev.filter((l) => l.id !== targetLayerId));
    // 削除したレイヤーが選択中だった場合はbaseに戻す
    if (layerId === targetLayerId) {
      setLayerId("base");
    }
  };

  return (
    <>
      <MainLayout
        header={
          <AppHeader
            isActive={isActive}
            onToggleActive={() => setIsActive(!isActive)}
          />
        }
        mainContent={
          <KeyRemapSection
            keyboardLayout={keyboardLayout}
            layerId={layerId}
            layers={layers}
            layout={layout}
            onAddLayer={addLayer}
            onKeyClick={(vk) => setEditingKey(vk)}
            onLayerChange={setLayerId}
            onLayoutToggle={toggleLayout}
            onRemoveLayer={removeLayer}
          />
        }
        sideContent={<LogList logs={logs} />}
      />

      <ModalLayout
        editingKey={editingKey}
        onClose={() => setEditingKey(null)}
        title="Edit Key Mapping"
      >
        {(e) => (
          <KeyEditorForm
            keyboardLayout={keyboardLayout}
            layerId={layerId}
            layers={layers.map((l) => ({ id: l.id }))}
            onClose={() => setEditingKey(null)}
            onRemove={(trigger) => removeMapping(e, trigger)}
            onSave={(trigger, action) => saveMapping(e, trigger, action)}
            targetVk={e}
          />
        )}
      </ModalLayout>
    </>
  );
}
