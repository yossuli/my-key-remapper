import { ToggleButton } from "@/components/atoms/ToggleButton";
import {
  ActionSelector,
  ActionSelectorContent,
} from "@/components/molecules/forms/ActionSelector";
import { LayerSelector } from "@/components/molecules/forms/LayerSelector";
import { MousePositionInput } from "@/components/molecules/forms/MousePositionInput";
import { TimingInput } from "@/components/molecules/forms/TimingInput";
import { RemapKeySection } from "@/components/organisms/editor/RemapKeySection";
import { VStack } from "@/components/template/Flex";
import type { LayoutType } from "@/types";
import { getLayerDescription } from "@/utils/getLayerDescription";
import type {
  ActionType,
  Layer,
  TriggerType,
} from "../../../../../shared/types/remapConfig";
import type {
  KeyEditorUIActions,
  KeyEditorUIHandlers,
  KeyEditorUIState,
  MouseHandlers,
  MouseState,
} from "./KeyEditorForm";

const DEFAULT_CURSOR_RETURN_DELAY_MS = 1000;

interface ActionSettingsSectionProps {
  actionType: ActionType;
  selectedTrigger: TriggerType;
  selectedLayerId: string;
  layers: Layer[];
  layout: LayoutType;
  targetVk: number;
  newTargetKeys: number[];

  // Grouped state & handlers
  mouseState: MouseState;
  mouseHandlers: MouseHandlers;
  keyEditorState: KeyEditorUIState;
  keyEditorActions: KeyEditorUIActions;
  keyEditorUIHandlers: KeyEditorUIHandlers;

  // Additional handlers
  setActionType: (type: ActionType) => void;
  setSelectedLayerId: (id: string) => void;
}

export function ActionSettingsSection({
  actionType, // KeyEditorForm から受け取り
  selectedTrigger, // KeyEditorForm から受け取り
  selectedLayerId, // KeyEditorForm から受け取り
  layers, // KeyEditorForm から受け取り
  layout, // KeyEditorForm から受け取り
  targetVk, // KeyEditorForm から受け取り
  newTargetKeys, // KeyEditorForm から受け取り
  mouseState, // 📦 KeyEditorForm でグループ化 → 🎁 → ∈ MousePositionInput で使用
  mouseHandlers, // 📦 KeyEditorForm でグループ化 → 🎁 → ∈ MousePositionInput で使用
  keyEditorState, // 📦 KeyEditorForm でグループ化 → 🎁 → ∈ RemapKeySection で使用
  keyEditorActions, // 📦 KeyEditorForm でグループ化 → 🎁 → ∈ RemapKeySection で使用
  keyEditorUIHandlers, // 📦 KeyEditorForm でグループ化 → 🎁 → ∈ RemapKeySection/MousePositionInput で使用
  setActionType, // KeyEditorForm から受け取り
  setSelectedLayerId, // KeyEditorForm から受け取り
}: ActionSettingsSectionProps) {
  return (
    <ActionSelector
      actionType={actionType}
      gap={2}
      onActionTypeChange={setActionType}
      triggerType={selectedTrigger}
    >
      <ActionSelectorContent value="remap">
        <RemapKeySection
          keyEditorActions={keyEditorActions}
          keyEditorState={keyEditorState}
          keyEditorUIHandlers={keyEditorUIHandlers}
          layout={layout}
          newTargetKeys={newTargetKeys}
          targetVk={targetVk}
        />
      </ActionSelectorContent>

      <ActionSelectorContent value={["layerToggle", "layerMomentary"]}>
        <LayerSelector
          description={getLayerDescription(actionType)}
          layers={layers}
          onLayerChange={setSelectedLayerId}
          selectedLayerId={selectedLayerId}
        />
      </ActionSelectorContent>

      <ActionSelectorContent value="mouseMove">
        <VStack gap={4}>
          <p className="text-muted-foreground text-sm">
            マウスカーソルを指定座標に移動します
          </p>

          <MousePositionInput
            idPrefix="mouse"
            mouseHandlers={mouseHandlers}
            mouseState={mouseState}
            setFocused={keyEditorUIHandlers.setIsInputFocused}
          />
        </VStack>
      </ActionSelectorContent>

      <ActionSelectorContent value="mouseClick">
        <VStack className="w-full justify-center" gap={4}>
          <p className="text-muted-foreground text-sm">
            指定座標をクリックします
          </p>

          <MousePositionInput
            idPrefix="click"
            mouseHandlers={mouseHandlers}
            mouseState={mouseState}
            setFocused={keyEditorUIHandlers.setIsInputFocused}
          >
            <VStack className="h-full justify-around" gap={2}>
              <ToggleButton
                className="w-full"
                labels={{
                  left: "左クリック",
                  middle: "中クリック",
                  right: "右クリック",
                }}
                onChange={mouseHandlers.setMouseButton}
                options={["left", "middle", "right"] as const}
                value={mouseState.button}
              />

              <ToggleButton
                className="w-full"
                labels={{
                  1: "シングル",
                  2: "ダブル",
                }}
                onChange={mouseHandlers.setClickCount}
                options={[1, 2] as const}
                value={mouseState.clickCount}
              />
            </VStack>
          </MousePositionInput>
        </VStack>
      </ActionSelectorContent>

      <ActionSelectorContent value="cursorReturn">
        <VStack gap={4}>
          <p className="text-muted-foreground text-sm">
            キー押下時のカーソル位置を記録し、指定時間後に戻ります
          </p>

          <TimingInput
            defaultValue={DEFAULT_CURSOR_RETURN_DELAY_MS}
            id="cursorReturnDelay"
            label="遅延時間 (ms)"
            onValueChange={(val) =>
              val !== undefined && mouseHandlers.setCursorReturnDelayMs(val)
            }
            setFocused={keyEditorUIHandlers.setIsInputFocused}
            value={mouseState.cursorReturnDelayMs}
          />
        </VStack>
      </ActionSelectorContent>
    </ActionSelector>
  );
}
