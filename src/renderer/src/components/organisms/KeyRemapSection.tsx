import { Settings, Zap } from "lucide-react";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { LayoutToggle } from "@/components/molecules/display/LayoutToggle";
import { TriggerTabs } from "@/components/molecules/forms/TriggerTabs";
import { KeyboardGrid } from "@/components/organisms/KeyboardGrid";
import { LayerTabs } from "@/components/organisms/keyboard/LayerTabs";
import type {
  LayerActions,
  LayerState,
  MappingActions,
  RemapActions,
} from "@/components/pages/KeyRemapperPage";
import { HStack, VStack } from "@/components/template/Flex";
import { useQuickRemap } from "@/hooks/useQuickRemap";
import type { KeyboardLayout, LayoutType } from "@/types";
import { cn } from "@/utils/cn";
import type {
  KeyBinding,
  TriggerType,
} from "../../../../shared/types/remapConfig";

interface KeyRemapSectionProps {
  // Layer state & actions
  layerState: LayerState;
  layerActions: LayerActions;

  // Mapping actions
  mappingActions: MappingActions;

  // Remap actions
  remapActions: RemapActions;

  // UI state
  layout: LayoutType;
  keyboardLayout: KeyboardLayout;
  bindings: Record<number, KeyBinding[]>;
  selectedTrigger: TriggerType;
  onLayoutToggle: () => void;
  onTriggerChange: (trigger: TriggerType) => void;
  setEditingKey: Dispatch<SetStateAction<number | null>>;
}

export function KeyRemapSection({
  layerState,
  layerActions,
  mappingActions,
  remapActions,
  layout,
  keyboardLayout,
  bindings,
  selectedTrigger,
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
      selectedLayerId: layerState.layerId,
      targetKeys: [],
      selectedTrigger,
      keyboardLayout,
      onSaveMapping: mappingActions.saveMapping,
    });

  const onKeyClick = (vk: number) => {
    // クイック設定モードの場合は即座にリマップ設定待ち状態に
    if (isQuickEditMode) {
      startQuickEditing(vk);
      return;
    }
    // 通常モードの場合はモーダルを開く
    remapActions.disableRemap();
    setEditingKey(vk);
  };

  const onToggleQuickEditMode = useCallback(() => {
    setIsQuickEditMode((prev) => {
      const next = !prev;
      // クイックモード開始時はリマップを無効化、終了時は有効化
      if (next) {
        remapActions.disableRemap();
      } else {
        remapActions.enableRemap();
      }
      return next;
    });
  }, [remapActions]);

  return (
    <VStack as="section" gap={4}>
      <HStack className="justify-between gap-4">
        <LayerTabs layerActions={layerActions} layerState={layerState} />
        <HStack className="gap-2">
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
            variant={isQuickEditMode ? "default" : "secondary"}
          >
            <Icon icon={Zap} />
            {isQuickEditMode ? "Quick ON" : "Quick"}
          </Button>
        </HStack>
      </HStack>

      <div className="overflow-x-auto">
        <KeyboardGrid
          bindings={bindings}
          keyboardLayout={keyboardLayout}
          layerState={layerState}
          layout={layout}
          mappingActions={mappingActions}
          onKeyClick={onKeyClick}
          quickEditingKey={quickEditingKey}
          selectedTrigger={selectedTrigger}
        />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          <Icon className="opacity-70" icon={Settings} size="md" />
          Keyboard Layout: {layout}
        </h2>
        <LayoutToggle currentLayout={layout} onToggle={onLayoutToggle} />
      </div>
    </VStack>
  );
}
