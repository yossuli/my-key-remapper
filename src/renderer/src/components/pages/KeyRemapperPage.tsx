import { useMemo, useState } from "react";
import {
  KEYBOARD_LAYOUT,
  SWITCH_LAYOUT_RULE,
} from "../../../../shared/constants";
import type { TriggerType } from "../../../../shared/types/remapConfig";
import { useKeyEventLog } from "../../hooks/useKeyEventLog";
import { useLayerState } from "../../hooks/useLayerState";
import { useRemapControl } from "../../hooks/useRemapControl";
import type { LayoutType } from "../../types";
import { AppHeader } from "../organisms/AppHeader";
import { KeyEditorForm } from "../organisms/KeyEditorForm";
import { KeyRemapSection } from "../organisms/KeyRemapSection";
import { LogList } from "../organisms/LogList";
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
    saveMapping,
    removeMapping,
  } = useLayerState();
  const { isActive, toggleActive, enableRemap, disableRemap } =
    useRemapControl();

  // UI状態
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [layout, setLayout] = useState<LayoutType>("JIS");
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("tap");

  // キーボードレイアウト
  const keyboardLayout = useMemo(() => KEYBOARD_LAYOUT.base[layout], [layout]);

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
          <AppHeader isActive={isActive} onToggleActive={toggleActive} />
        </Header>
        <Main>
          <KeyRemapSection
            bindings={currentBindings}
            disableRemap={disableRemap}
            enableRemap={enableRemap}
            isBaseLayer={layerId === "base"}
            keyboardLayout={keyboardLayout}
            layerId={layerId}
            layers={layers}
            layout={layout}
            onAddLayer={addLayer}
            onLayerChange={setLayerId}
            onLayoutToggle={toggleLayout}
            onRemoveLayer={removeLayer}
            onRemoveMapping={(from) => removeMapping(from, selectedTrigger)}
            onSaveMapping={saveMapping}
            onTriggerChange={setSelectedTrigger}
            selectedTrigger={selectedTrigger}
            setEditingKey={setEditingKey}
          />
        </Main>
        <Side>
          <LogList logs={logs} />
        </Side>
      </MainLayout>

      <ModalLayout
        editingKey={editingKey}
        onClose={handleCloseEditor}
        title="Edit Key Mapping"
      >
        {(e) => (
          <KeyEditorForm
            layerId={layerId}
            layers={layers.map((l) => ({ id: l.id }))}
            layout={layout}
            onClose={handleCloseEditor}
            onRemove={(trigger) => removeMapping(e, trigger)}
            onSave={(trigger, action) => saveMapping(e, trigger, action)}
            targetVk={e}
            trigger={selectedTrigger}
          />
        )}
      </ModalLayout>
    </>
  );
}
