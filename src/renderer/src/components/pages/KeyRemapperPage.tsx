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
  const layerActions = { setLayerId, addLayer, removeLayer, reorderLayers };
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
