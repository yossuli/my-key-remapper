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
  LayerState,
  MappingActions,
} from "@/components/pages/KeyRemapperPage";
import { HStack, VStack } from "@/components/template/Flex";
import type { UseGlobalSettingsReturn } from "@/hooks/useGlobalSettings";
import type { UseKeyEventLogReturn } from "@/hooks/useKeyEventLog";
import type { UseLayerStackReturn } from "@/hooks/useLayerStack";
import type { UseLayerStateReturn } from "@/hooks/useLayerState";
import { useQuickRemap } from "@/hooks/useQuickRemap";
import type { UseRemapControlReturn } from "@/hooks/useRemapControl";
import type { KeyboardLayout, LayoutType } from "@/types";
import { cn } from "@/utils/cn";
import type {
  KeyBinding,
  TriggerType,
} from "../../../../shared/types/remapConfig";

// --- 型定義 ---

export type LayerActions = Pick<
  UseLayerStateReturn,
  "setLayerId" | "addLayer" | "removeLayer" | "reorderLayers" | "updateLayer"
>;

export type RemapActions = Pick<
  UseRemapControlReturn,
  "toggleActive" | "enableRemap" | "disableRemap"
>;

export type GlobalSettingsControl = Pick<
  UseGlobalSettingsReturn,
  "updateGlobalSettings"
>;

export type LayerStackControl = Pick<
  UseLayerStackReturn,
  "stack" | "refresh" | "resetToLayer"
>;

export type LogState = Pick<UseKeyEventLogReturn, "logs">;

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
  layerState, // 🎁 → 🎁/🔨🔥 (A. Layer Management Flow)
  layerActions, // 🎁 → 🎁/🔨🔥 (A. Layer Management Flow)
  mappingActions, // 🎁 → 🎁/🔥 (B. Mapping & Remap Actions)
  remapActions, // 🎁 → 🔥 (B. Mapping & Remap Actions)
  layout, // 🚌 → 🚌 (C. UI Configuration)
  keyboardLayout, // 🚌 → 🚌 (C. UI Configuration)
  bindings, // 🚌 → 🚌 (C. UI Configuration)
  selectedTrigger, // 🚌🔥 → 🚌🔥 (C. UI Configuration)
  onLayoutToggle, // 🚌 → 🔥 (D. Event Handlers)
  onTriggerChange, // 🚌 → 🔥 (D. Event Handlers)
  setEditingKey, // 🚌 → 🔥 (D. Event Handlers)
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
        <LayerTabs
          layerActions={layerActions}
          layerState={layerState}
          layout={layout}
        />{" "}
        {/* 🎁 → 🔨🔥 (A. Layer Management Flow) */}
        <HStack className="gap-2">
          <TriggerTabs
            onTriggerChange={onTriggerChange} // 🚌 → 🔥 (D. Event Handlers)
            selectedTrigger={selectedTrigger} // 🚌🔥 → 🔥 (C. UI Configuration)
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
          bindings={bindings} // 🚌 → 🚌🔥 (C. UI Configuration)
          keyboardLayout={keyboardLayout} // 🚌 → 🚌🔥 (C. UI Configuration)
          layerState={layerState} // 🎁 → 🎁 (A. Layer Management Flow)
          layout={layout} // 🚌 → 🚌🔥 (C. UI Configuration)
          mappingActions={mappingActions} // 🎁 → 🎁 (B. Mapping & Remap Actions)
          onKeyClick={onKeyClick}
          quickEditingKey={quickEditingKey}
          selectedTrigger={selectedTrigger} // 🚌🔥 → 🚌🔥 (C. UI Configuration)
        />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          <Icon className="opacity-70" icon={Settings} size="md" />
          Keyboard Layout: {layout}
        </h2>
        <LayoutToggle currentLayout={layout} onToggle={onLayoutToggle} />{" "}
        {/* 🚌 → 🔥 (D. Event Handlers) */}
      </div>
    </VStack>
  );
}
