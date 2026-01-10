import { useMemo, useState } from "react";
import { Show } from "@/components/control/Show";
import { AppHeader } from "@/components/organisms/AppHeader";
import { KeyEditorForm } from "@/components/organisms/editor/KeyEditorForm";
import { GlobalSettingsForm } from "@/components/organisms/GlobalSettingsForm";
import { KeyRemapSection } from "@/components/organisms/KeyRemapSection";
import { LayerStatusPanel } from "@/components/organisms/LayerStatusPanel";
import { LogList } from "@/components/organisms/LogList";
import { PressedKeysPanel } from "@/components/organisms/PressedKeysPanel";
import { VStack } from "@/components/template/Flex";
import {
  Header,
  Main,
  MainLayout,
  Side,
} from "@/components/template/MainLayout";
import { ModalLayout } from "@/components/template/ModalLayout";
import { type UseLayerStateReturn, useLayerState } from "@/hooks/useLayerState";
import { useRemapControl } from "@/hooks/useRemapControl";
import type { LayoutType } from "@/types";
import {
  KEYBOARD_LAYOUT,
  SWITCH_LAYOUT_RULE,
} from "../../../../shared/constants";
import type { TriggerType } from "../../../../shared/types/remapConfig";

// --- 型定義 ---

export type LayerState = Pick<UseLayerStateReturn, "layers" | "layerId">;

export interface MappingActions {
  saveMapping: UseLayerStateReturn["saveMapping"];
  removeMapping: (from: number) => void;
}

export function KeyRemapperPage() {
  // カスタムフックでロジックを分離
  const {
    layers,
    layerId,
    currentBindings,
    saveMapping,
    removeMapping,
    ...layerActions
  } = useLayerState();
  const { isActive, ...remapActions } = useRemapControl();

  // UI状態
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [layout, setLayout] = useState<LayoutType>("JIS");
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("tap");
  const [simpleMode, setSimpleMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // キーボードレイアウト
  const keyboardLayout = useMemo(() => KEYBOARD_LAYOUT.base[layout], [layout]);

  // 利用可能なレイヤーID一覧
  const availableLayers = useMemo(() => layers.map((l) => l.id), [layers]);

  const toggleLayout = () => {
    setLayout((prev) => SWITCH_LAYOUT_RULE[prev]);
  };

  const handleCloseEditor = () => {
    remapActions.enableRemap();
    setEditingKey(null);
  };

  const layerState: LayerState = { layers, layerId };
  const mappingActions: MappingActions = {
    saveMapping,
    removeMapping: (from: number) => removeMapping(from, selectedTrigger),
  };
  return (
    <>
      <MainLayout>
        <Header>
          <AppHeader
            isActive={isActive} // 🆕 → 🔥 (E. App Header Control)
            onOpenSettings={() => setIsSettingsOpen(true)} // 🆕 → 🔥 (E. App Header Control)
            onToggleActive={remapActions.toggleActive} // 🆕 → 🔥 (E. App Header Control)
            onToggleSimpleMode={() => setSimpleMode((prev) => !prev)} // 🆕 → 🔥 (E. App Header Control)
            simpleMode={simpleMode} // 🆕 → 🔥 (E. App Header Control)
          />
        </Header>
        <Main>
          <Show condition={!simpleMode}>
            <KeyRemapSection
              bindings={currentBindings} // 🆕 → 🚌 (C. UI Configuration)
              keyboardLayout={keyboardLayout} // 🆕 → 🚌 (C. UI Configuration)
              layerActions={layerActions} // 📦 → 🎁 (A. Layer Management Flow)
              layerState={layerState} // 📦 → 🎁 (A. Layer Management Flow)
              layout={layout} // 🆕 → 🚌 (C. UI Configuration)
              mappingActions={mappingActions} // 📦 → 🎁 (B. Mapping & Remap Actions)
              onLayoutToggle={toggleLayout} // 🆕 → 🚌 (D. Event Handlers)
              onTriggerChange={setSelectedTrigger} // 🆕 → 🚌 (D. Event Handlers)
              remapActions={remapActions} // 📦 → 🎁 (B. Mapping & Remap Actions)
              selectedTrigger={selectedTrigger} // 🆕 → 🚌🔥 (C. UI Configuration)
              setEditingKey={setEditingKey} // 🆕 → 🚌 (D. Event Handlers)
            />
          </Show>
        </Main>
        <Side>
          <VStack gap={4}>
            <LayerStatusPanel
              availableLayers={availableLayers} // 🆕 → 🧩🔥 (A. Layer Management Flow - Derived)
            />
            <PressedKeysPanel layout={layout} />
            {/* 🆕 → 🔥 (F. Pressed Keys Panel) */}
            <Show condition={!simpleMode}>
              <LogList />
            </Show>
          </VStack>
        </Side>
      </MainLayout>

      <ModalLayout onClose={handleCloseEditor} value={editingKey}>
        {(e) => (
          <KeyEditorForm
            layerId={layerId} // ∈ → 🧩🔥 (A. Layer Management Flow)
            layers={layers} // ∈ → 🧩🔥 (A. Layer Management Flow)
            layout={layout} // 🆕 → 🧩🔥 (C. UI Configuration)
            onClose={handleCloseEditor} // 🆕 → 🔥 (I. Key Editor Modal)
            onRemove={(trigger) => removeMapping(e, trigger)} // 🆕 → 🔥 (I. Key Editor Modal)
            onSave={saveMapping(e)} // 🆕 → 🔥 (I. Key Editor Modal)
            targetVk={e} // 🆕 → 🔥 (I. Key Editor Modal)
            trigger={selectedTrigger} // 🆕 → 🧩🔥 (C. UI Configuration)
          />
        )}
      </ModalLayout>

      <ModalLayout
        onClose={() => setIsSettingsOpen(false)}
        value={isSettingsOpen ? true : null}
      >
        {() => <GlobalSettingsForm />}
      </ModalLayout>
    </>
  );
}
