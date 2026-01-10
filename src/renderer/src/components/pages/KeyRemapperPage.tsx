import { useMemo, useState } from "react";
import {
  KEYBOARD_LAYOUT,
  SWITCH_LAYOUT_RULE,
} from "../../../../shared/constants";
import type { Action, TriggerType } from "../../../../shared/types/remapConfig";
import {
  type UseGlobalSettingsReturn,
  useGlobalSettings,
} from "../../hooks/useGlobalSettings";
import {
  type UseKeyEventLogReturn,
  useKeyEventLog,
} from "../../hooks/useKeyEventLog";
import {
  type UseLayerStackReturn,
  useLayerStack,
} from "../../hooks/useLayerStack";
import {
  type UseLayerStateReturn,
  useLayerState,
} from "../../hooks/useLayerState";
import {
  type UseRemapControlReturn,
  useRemapControl,
} from "../../hooks/useRemapControl";
import type { LayoutType } from "../../types";
import { Show } from "../control/Show";
import { AppHeader } from "../organisms/AppHeader";
import { KeyEditorForm } from "../organisms/editor/KeyEditorForm";
import { GlobalSettingsForm } from "../organisms/GlobalSettingsForm";
import { KeyRemapSection } from "../organisms/KeyRemapSection";
import { LayerStatusPanel } from "../organisms/LayerStatusPanel";
import { LogList } from "../organisms/LogList";
import { PressedKeysPanel } from "../organisms/PressedKeysPanel";
import { VStack } from "../template/Flex";
import { Header, Main, MainLayout, Side } from "../template/MainLayout";
import { ModalLayout } from "../template/ModalLayout";

// --- 型定義 ---

// レイヤー操作関連
export type LayerActions = Pick<
  UseLayerStateReturn,
  "setLayerId" | "addLayer" | "removeLayer" | "reorderLayers"
>;

// レイヤー状態関連
export type LayerState = Pick<UseLayerStateReturn, "layers" | "layerId">;

// リマップ制御関連
export type RemapActions = Pick<
  UseRemapControlReturn,
  "toggleActive" | "enableRemap" | "disableRemap"
>;

// マッピング操作関連
export interface MappingActions {
  saveMapping: (from: number, trigger: TriggerType, action: Action) => void;
  removeMapping: (from: number) => void;
}

// グローバル設定関連
export type GlobalSettingsControl = Pick<
  UseGlobalSettingsReturn,
  "updateGlobalSettings"
>;

// レイヤースタック関連
export type LayerStackControl = Pick<
  UseLayerStackReturn,
  "stack" | "refresh" | "resetToLayer"
>;

// ログ関連
export type LogState = Pick<UseKeyEventLogReturn, "logs">;

export function KeyRemapperPage() {
  // カスタムフックでロジックを分離
  const { logs } = useKeyEventLog();
  const {
    layers,
    layerId,
    setLayerId,
    currentBindings,
    addLayer,
    removeLayer,
    reorderLayers,
    saveMapping,
    removeMapping,
  } = useLayerState();
  const { isActive, toggleActive, enableRemap, disableRemap } =
    useRemapControl();
  const { stack, refresh, resetToLayer } = useLayerStack();
  const { globalSettings, updateGlobalSettings } = useGlobalSettings();

  // UI状態
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [layout, setLayout] = useState<LayoutType>("JIS");
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("tap");
  const [simpleMode, setSimpleMode] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // キーボードレイアウト
  const keyboardLayout = useMemo(() => KEYBOARD_LAYOUT.base[layout], [layout]);

  // 利用可能なレイヤーID一覧
  const availableLayers = useMemo(() => layers.map((l) => l.id), [layers]);

  const toggleLayout = () => {
    setLayout((prev) => SWITCH_LAYOUT_RULE[prev]);
  };

  const handleCloseEditor = () => {
    enableRemap();
    setEditingKey(null);
  };
  const layerActions: LayerActions = {
    setLayerId,
    addLayer,
    removeLayer,
    reorderLayers,
  };
  const mappingActions = {
    saveMapping,
    removeMapping: (from: number) => removeMapping(from, selectedTrigger),
  };
  const remapActions = { toggleActive, disableRemap, enableRemap };
  const layerState = { layers, layerId };
  return (
    <>
      <MainLayout>
        <Header>
          <AppHeader
            isActive={isActive}
            onOpenSettings={() => setSettingsModalOpen(true)}
            onToggleActive={toggleActive}
            onToggleSimpleMode={() => setSimpleMode((prev) => !prev)}
            simpleMode={simpleMode}
          />
        </Header>
        <Main>
          <Show condition={!simpleMode}>
            <KeyRemapSection
              bindings={currentBindings}
              keyboardLayout={keyboardLayout}
              layerActions={layerActions}
              layerState={layerState}
              layout={layout}
              mappingActions={mappingActions}
              onLayoutToggle={toggleLayout}
              onTriggerChange={setSelectedTrigger}
              remapActions={remapActions}
              selectedTrigger={selectedTrigger}
              setEditingKey={setEditingKey}
            />
          </Show>
        </Main>
        <Side>
          <VStack gap={4}>
            <LayerStatusPanel
              availableLayers={availableLayers}
              onRefresh={refresh}
              onResetToLayer={resetToLayer}
              stack={stack}
            />
            <PressedKeysPanel layout={layout} />
            <Show condition={!simpleMode}>
              <LogList logs={logs} />
            </Show>
          </VStack>
        </Side>
      </MainLayout>

      <ModalLayout onClose={handleCloseEditor} value={editingKey}>
        {(e) => (
          <KeyEditorForm
            defaultHoldThresholdMs={globalSettings?.defaultHoldThresholdMs}
            defaultTapIntervalMs={globalSettings?.defaultTapIntervalMs}
            layerId={layerId}
            layers={layers}
            layout={layout}
            onClose={handleCloseEditor}
            onRemove={(trigger) => removeMapping(e, trigger)}
            onSave={(trigger, action, timing) =>
              saveMapping(e, trigger, action, timing)
            }
            targetVk={e}
            trigger={selectedTrigger}
          />
        )}
      </ModalLayout>

      <ModalLayout
        onClose={() => setSettingsModalOpen(false)}
        value={settingsModalOpen ? globalSettings : null}
      >
        {(currentSettings) => (
          <GlobalSettingsForm
            globalSettings={currentSettings}
            onSave={updateGlobalSettings}
          />
        )}
      </ModalLayout>
    </>
  );
}
