import { useMemo, useState } from "react";
import {
  KEYBOARD_LAYOUT,
  SWITCH_LAYOUT_RULE,
} from "../../../../shared/constants";
import type { TriggerType } from "../../../../shared/types/remapConfig";
import { useGlobalSettings } from "../../hooks/useGlobalSettings";
import { useKeyEventLog } from "../../hooks/useKeyEventLog";
import { useLayerStack } from "../../hooks/useLayerStack";
import { useLayerState } from "../../hooks/useLayerState";
import { useRemapControl } from "../../hooks/useRemapControl";
import type { LayoutType } from "../../types";
import { Show } from "../control/Show";
import { PressedKeysPanel } from "../molecules/PressedKeysPanel";
import { AppHeader } from "../organisms/AppHeader";
import { GlobalSettingsForm } from "../organisms/GlobalSettingsForm";
import { KeyEditorForm } from "../organisms/KeyEditorForm";
import { KeyRemapSection } from "../organisms/KeyRemapSection";
import { LayerStatusPanel } from "../organisms/LayerStatusPanel";
import { LogList } from "../organisms/LogList";
import { Header, Main, MainLayout, Side } from "../template/MainLayout";
import { ModalLayout } from "../template/ModalLayout";
import { VStack } from "../template/Flex";

export function KeyRemapperPage() {
  // カスタムフックでロジックを分離
  const { logs } = useKeyEventLog();
  const {
    layers,
    layerOrder,
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
  const { globalSettings, updateGlobalSettings, isLoading } =
    useGlobalSettings();

  // UI状態
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [layout, setLayout] = useState<LayoutType>("JIS");
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("tap");
  const [simpleMode, setSimpleMode] = useState(false);

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

  return (
    <>
      <MainLayout>
        <Header>
          <AppHeader
            isActive={isActive}
            onToggleActive={toggleActive}
            onToggleSimpleMode={() => setSimpleMode((prev) => !prev)}
            simpleMode={simpleMode}
          />
        </Header>
        <Main>
          <Show condition={!simpleMode}>
            <KeyRemapSection
              bindings={currentBindings}
              disableRemap={disableRemap}
              enableRemap={enableRemap}
              keyboardLayout={keyboardLayout}
              layerId={layerId}
              layers={layers}
              layout={layout}
              onAddLayer={addLayer}
              onLayerChange={setLayerId}
              onLayoutToggle={toggleLayout}
              onRemoveLayer={removeLayer}
              onRemoveMapping={(from) => removeMapping(from, selectedTrigger)}
              onReorderLayers={reorderLayers}
              onSaveMapping={saveMapping}
              onTriggerChange={setSelectedTrigger}
              selectedTrigger={selectedTrigger}
              setEditingKey={setEditingKey}
            />
          </Show>
        </Main>
        <Side>
          <div className="space-y-4">
            <LayerStatusPanel
              availableLayers={availableLayers}
              onRefresh={refresh}
              onResetToLayer={resetToLayer}
              stack={stack}
            />
            <PressedKeysPanel layout={layout} />
            <Show condition={!simpleMode}>
              <Show condition={!isLoading && globalSettings !== null}>
                <GlobalSettingsForm
                  globalSettings={globalSettings}
                  onSave={updateGlobalSettings}
                />
              </Show>
              <LogList logs={logs} />
            </Show>
          </div>
        </Side>
      </MainLayout>

      <ModalLayout
        editingKey={editingKey}
        onClose={handleCloseEditor}
      >
        {(e) => {
          // 現在のレイヤーからタイミング設定を取得
          const currentLayer = layers.find((l) => l.id === layerId);
          const existingTiming = currentLayer?.keyTimings?.[e];
          return (
            <KeyEditorForm
              defaultHoldThresholdMs={
                globalSettings?.defaultHoldThresholdMs
              }
              defaultTapIntervalMs={
                globalSettings?.defaultTapIntervalMs
              }
              existingTiming={existingTiming}
              layerId={layerId}
              layers={layers.map((l) => ({ id: l.id }))}
              layout={layout}
              onClose={handleCloseEditor}
              onRemove={(trigger) => removeMapping(e, trigger)}
              onSave={(trigger, action, timing) =>
                saveMapping(e, trigger, action, timing)
              }
              targetVk={e}
              trigger={selectedTrigger}
            />
          );
        }}
      </ModalLayout>
    </>
  );
}
