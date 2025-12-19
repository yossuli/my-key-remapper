import { useCallback, useState } from "react";
import type {
  Action,
  Layer,
  TriggerType,
} from "../../../../shared/types/remapConfig";
import { useBindingConfig } from "../../hooks/useBindingConfig";
import { useEventHandler } from "../../hooks/useEventHandler";
import { useKeyEditorActions } from "../../hooks/useKeyEditorAction";
import { useKeyHoldAction } from "../../hooks/useKeyHoldAction";
import type { LayoutType } from "../../types";
import { getLayerDescription } from "../../utils/getLayerDescription";
import { Button } from "../atoms/Button";
import { WithRemoveBadge } from "../atoms/RemoveBadge";
import { HandleEmpty } from "../control/HandleEmpty";
import { Show } from "../control/Show";
import { ActionTypeSelector } from "../molecules/ActionTypeSelector";
import { KeyDisplay } from "../molecules/KeyDisplay";
import { LayerSelector } from "../molecules/LayerSelector";
import { TriggerTabs } from "../molecules/TriggerTabs";

interface KeyEditorFormProps {
  targetVk: number;
  layerId: string;
  layout: LayoutType;
  layers: Pick<Layer, "id">[];
  onSave: (trigger: TriggerType, action: Action) => void;
  onRemove: (trigger: TriggerType) => void;
  onClose: () => void;
}

export function KeyEditorForm({
  targetVk,
  layerId,
  layout,
  layers,
  onSave,
  onRemove,
  onClose,
}: KeyEditorFormProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("tap");
  console.log(targetVk);
  const binding = useBindingConfig({
    targetVk,
    layerId,
    defaultLayerId: layers[0]?.id || "",
  });
  const {
    state: { actionType, selectedLayerId, targetKeys, hasExistingBinding },
    clearTargetKeys,
    setSelectedLayerId,
    loadBindingForTrigger,
    setActionType,
  } = binding;

  const {
    newTargetKeys,
    canSave,
    addHoldKeys,
    removeHoldKeys,
    removeKey,
    handleSave,
    handleRemove,
  } = useKeyEditorActions({
    state: {
      actionType,
      selectedLayerId,
      targetKeys,
      hasExistingBinding,
    },
    targetVk,
    selectedTrigger,
    onSave,
    onRemove,
    onClose,
  });

  const { handleHoldKeyDown, handleHoldKeyUp } = useKeyHoldAction({
    targetKey: "Enter",
  });

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (actionType !== "remap") {
        return;
      }

      handleHoldKeyDown(e, {
        onOtherKeyDown() {
          addHoldKeys(e);
        },
        onHold() {
          handleSave();
        },
      });
    },
    [actionType, handleHoldKeyDown, handleSave, addHoldKeys]
  );

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      handleHoldKeyUp(e, {
        onTap() {
          const enterKeyCode = 13;
          if (!targetKeys.includes(enterKeyCode)) {
            addHoldKeys(e);
          }
        },
        onOtherKeyUp() {
          removeHoldKeys(e);
        },
      });
    },
    [handleHoldKeyUp, targetKeys, addHoldKeys, removeHoldKeys]
  );

  useEventHandler(
    [
      { type: "keydown", handler: onKeyDown },
      { type: "keyup", handler: onKeyUp },
    ],
    [onKeyDown, onKeyUp]
  );

  const handleTriggerChange = (newTrigger: TriggerType) => {
    setSelectedTrigger(newTrigger);
    loadBindingForTrigger(newTrigger);
  };
  return (
    <div className="space-y-4 p-6">
      {/* キー表示 */}
      <div className="flex items-center justify-center gap-4 font-bold text-2xl">
        <KeyDisplay layout={layout} vkCode={targetVk} />
      </div>

      {/* トリガー選択 */}
      <TriggerTabs
        onTriggerChange={handleTriggerChange}
        selectedTrigger={selectedTrigger}
      />

      {/* アクション種別選択 */}
      <ActionTypeSelector
        actionType={actionType}
        onActionTypeChange={setActionType}
        triggerType={selectedTrigger}
      />

      {/* リマップ設定 */}
      <Show condition={actionType === "remap"}>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-4 font-bold text-xl">
            <KeyDisplay layout={layout} vkCode={targetVk} />
            <span className="text-muted-foreground">→</span>
            <HandleEmpty
              array={newTargetKeys.map((vk) => ({ id: vk }))}
              empty={
                <span className="rounded-md border border-muted-foreground border-dashed px-4 py-2 text-muted-foreground">
                  キーを長押して選択
                </span>
              }
            >
              {({ id: vk }) => (
                <WithRemoveBadge
                  disabled={newTargetKeys.length === 1}
                  onRemove={() => removeKey(vk)}
                >
                  <KeyDisplay layout={layout} variant="primary" vkCode={vk} />
                </WithRemoveBadge>
              )}
            </HandleEmpty>
          </div>
          <Button onClick={clearTargetKeys} size="sm" variant="ghost">
            クリア
          </Button>
        </div>
      </Show>

      {/* レイヤー選択 */}
      <Show
        condition={
          actionType === "layerToggle" || actionType === "layerMomentary"
        }
      >
        <LayerSelector
          description={getLayerDescription(actionType)}
          layers={layers}
          onLayerChange={setSelectedLayerId}
          selectedLayerId={selectedLayerId}
        />
      </Show>

      {/* ボタン */}
      <div className="flex justify-end gap-2 pt-2">
        <Show condition={hasExistingBinding}>
          <Button onClick={handleRemove} variant="destructive">
            削除
          </Button>
        </Show>
        <Button disabled={!canSave} onClick={handleSave} variant="primary">
          保存
        </Button>
      </div>
    </div>
  );
}
