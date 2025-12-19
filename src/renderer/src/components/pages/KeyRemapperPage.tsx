import { useCallback, useMemo, useState } from "react";
import {
  KEYBOARD_LAYOUT,
  SWITCH_LAYOUT_RULE,
} from "../../../../shared/constants";
import type { TriggerType } from "../../../../shared/types/remapConfig";
import { useKeyEventLog } from "../../hooks/useKeyEventLog";
import { useLayerState } from "../../hooks/useLayerState";
import { useQuickRemap } from "../../hooks/useQuickRemap";
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
  const [isQuickEditMode, setIsQuickEditMode] = useState(false);

  // キーボードレイアウト
  const keyboardLayout = useMemo(() => KEYBOARD_LAYOUT.base[layout], [layout]);

  // クイック設定モード
  const { editingKey: quickEditingKey, startEditing: startQuickEditing } =
    useQuickRemap({
      enabled: isQuickEditMode,
      selectedTrigger,
      onSaveMapping: saveMapping,
    });

  const toggleLayout = () => {
    setLayout((prev) => SWITCH_LAYOUT_RULE[prev]);
  };

  const toggleQuickEditMode = useCallback(() => {
    setIsQuickEditMode((prev) => !prev);
  }, []);

  const handleKeyClick = (vk: number) => {
    // クイック設定モードの場合は即座にリマップ設定待ち状態に
    if (isQuickEditMode) {
      startQuickEditing(vk);
      return;
    }
    // 通常モードの場合はモーダルを開く
    disableRemap();
    setEditingKey(vk);
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
            isBaseLayer={layerId === "base"}
            isQuickEditMode={isQuickEditMode}
            keyboardLayout={keyboardLayout}
            layerId={layerId}
            layers={layers}
            layout={layout}
            onAddLayer={addLayer}
            onKeyClick={handleKeyClick}
            onLayerChange={setLayerId}
            onLayoutToggle={toggleLayout}
            onRemoveLayer={removeLayer}
            onToggleQuickEditMode={toggleQuickEditMode}
            onTriggerChange={setSelectedTrigger}
            quickEditingKey={quickEditingKey}
            selectedTrigger={selectedTrigger}
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
          />
        )}
      </ModalLayout>
    </>
  );
}
