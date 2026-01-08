import { Settings, Zap } from "lucide-react";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from "react";
import type {
  Action,
  KeyBinding,
  Layer,
  TriggerType,
} from "../../../../shared/types/remapConfig";
import { useQuickRemap } from "../../hooks/useQuickRemap";
import type { KeyboardLayout, LayoutType } from "../../types";
import { cn } from "../../utils/cn";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { LayerTabs } from "../molecules/LayerTabs";
import { LayoutToggle } from "../molecules/LayoutToggle";
import { TriggerTabs } from "../molecules/TriggerTabs";
import { Row } from "../template/Flex";
import { KeyboardGrid } from "./KeyboardGrid";

interface KeyRemapSectionProps {
  layers: Layer[];
  layerId: string;
  layout: LayoutType;
  keyboardLayout: KeyboardLayout;
  bindings: Record<number, KeyBinding[]>;
  selectedTrigger: TriggerType;
  disableRemap: () => void;
  enableRemap: () => void;
  onLayerChange: (layerId: string) => void;
  onAddLayer: (layerId: string) => void;
  onRemoveLayer: (layerId: string) => void;
  onReorderLayers: (newOrder: string[]) => void;
  onRemoveMapping: (from: number) => void;
  onSaveMapping: (from: number, trigger: TriggerType, action: Action) => void;
  onLayoutToggle: () => void;
  onTriggerChange: (trigger: TriggerType) => void;
  setEditingKey: Dispatch<SetStateAction<number | null>>;
}

export function KeyRemapSection({
  layers,
  layerId,
  layout,
  keyboardLayout,
  bindings,
  selectedTrigger,
  disableRemap,
  enableRemap,
  onLayerChange,
  onAddLayer,
  onSaveMapping,
  onRemoveLayer,
  onReorderLayers,
  onRemoveMapping,
  onLayoutToggle,
  onTriggerChange,
  setEditingKey,
}: KeyRemapSectionProps) {
  const [isQuickEditMode, setIsQuickEditMode] = useState(false);

  // クイック設定モード
  const { editingKey: quickEditingKey, startEditing: startQuickEditing } =
    useQuickRemap({
      enabled: isQuickEditMode,
      hasExistingBinding: false,
      selectedLayerId: layerId,
      targetKeys: [],
      selectedTrigger,
      keyboardLayout,
      onSaveMapping,
    });

  const onKeyClick = (vk: number) => {
    // クイック設定モードの場合は即座にリマップ設定待ち状態に
    if (isQuickEditMode) {
      startQuickEditing(vk);
      return;
    }
    // 通常モードの場合はモーダルを開く
    disableRemap();
    setEditingKey(vk);
  };

  const onToggleQuickEditMode = useCallback(() => {
    setIsQuickEditMode((prev) => {
      const next = !prev;
      // クイックモード開始時はリマップを無効化、終了時は有効化
      if (next) {
        disableRemap();
      } else {
        enableRemap();
      }
      return next;
    });
  }, [disableRemap, enableRemap]);

  return (
    <section className="space-y-4">
      <Row className="justify-between gap-4">
        <LayerTabs
          activeLayerId={layerId}
          layers={layers}
          onAddLayer={onAddLayer}
          onLayerChange={onLayerChange}
          onRemoveLayer={onRemoveLayer}
          onReorder={onReorderLayers}
        />
        <Row className="gap-2">
          <TriggerTabs
            onTriggerChange={onTriggerChange}
            selectedTrigger={selectedTrigger}
            size="compact"
          />
          <Button
            className={cn(
              "gap-1",
              isQuickEditMode ? "bg-yellow-500 hover:bg-yellow-600" : ""
            )}
            onClick={onToggleQuickEditMode}
            size="sm"
            variant={isQuickEditMode ? "default" : "secondary"}
          >
            <Icon icon={Zap} size="sm" />
            {isQuickEditMode ? "Quick ON" : "Quick"}
          </Button>
        </Row>
      </Row>

      <div className="overflow-x-auto">
        <KeyboardGrid
          bindings={bindings}
          keyboardLayout={keyboardLayout}
          layerId={layerId}
          layout={layout}
          onKeyClick={onKeyClick}
          onRemoveMapping={onRemoveMapping}
          quickEditingKey={quickEditingKey}
          selectedTrigger={selectedTrigger}
        />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          <Icon className="opacity-70" icon={Settings} />
          Keyboard Layout: {layout}
        </h2>
        <LayoutToggle currentLayout={layout} onToggle={onLayoutToggle} />
      </div>
    </section>
  );
}
