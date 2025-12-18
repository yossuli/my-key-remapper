import { useState } from "react";
import type {
  Action,
  Layer,
  TriggerType,
} from "../../../../shared/types/remapConfig";
import { useBindingConfig } from "../../hooks/useBindingConfig";
import { useEnterToSave } from "../../hooks/useEnterToSave";
import { useKeyEditorActions } from "../../hooks/useKeyEditorState";
import { useRemapKeySelection } from "../../hooks/useRemapKeySelection";
import type { KeyboardLayout } from "../../types";
import { getLayerDescription } from "../../utils/getLayerDescription";
import { Button } from "../atoms/Button";
import { Mapped } from "../control/Mapped";
import { Show } from "../control/Show";
import { Conditional, Else, Then } from "../control/Ternary";
import { ActionTypeSelector } from "../molecules/ActionTypeSelector";
import { KeyDisplay } from "../molecules/KeyDisplay";
import { LayerSelector } from "../molecules/LayerSelector";
import { TriggerSelector } from "../molecules/TriggerSelector";

interface KeyEditorFormProps {
  targetVk: number;
  layerId: string;
  keyboardLayout: KeyboardLayout;
  layers: Pick<Layer, "id">[];
  onSave: (trigger: TriggerType, action: Action) => void;
  onRemove: (trigger: TriggerType) => void;
  onClose: () => void;
}

export function KeyEditorForm({
  targetVk,
  layerId,
  keyboardLayout,
  layers,
  onSave,
  onRemove,
  onClose,
}: KeyEditorFormProps) {
  // トリガー選択状態
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("tap");

  // バインディング設定
  const binding = useBindingConfig({
    targetVk,
    layerId,
    defaultLayerId: layers[0]?.id || "",
  });

  // トリガー変更時
  const handleTriggerChange = (newTrigger: TriggerType) => {
    setSelectedTrigger(newTrigger);
    binding.loadBindingForTrigger(newTrigger);
  };

  // 保存・削除アクション
  const { handleSave, handleRemove } = useKeyEditorActions({
    ...binding,
    selectedTrigger,
    onSave,
    onRemove,
    onClose,
  });

  // Enter長押しで保存
  const { isEnterActive } = useEnterToSave({
    onSave: handleSave,
    holdMs: 1000,
  });

  // リマップキー選択
  useRemapKeySelection({
    enabled: binding.actionType === "remap",
    targetKeys: binding.targetKeys,
    onAddKey: binding.addTargetKey,
    handleEnterTap: !isEnterActive(),
  });

  return (
    <div className="space-y-4 p-6">
      {/* キー表示 */}
      <div className="flex items-center justify-center gap-4 font-bold text-2xl">
        <KeyDisplay keyboardLayout={keyboardLayout} vkCode={targetVk} />
      </div>

      {/* トリガー選択 */}
      <TriggerSelector
        onTriggerChange={handleTriggerChange}
        selectedTrigger={selectedTrigger}
      />

      {/* アクション種別選択 */}
      <ActionTypeSelector
        actionType={binding.actionType}
        onActionTypeChange={binding.setActionType}
        triggerType={selectedTrigger}
      />

      {/* リマップ設定 */}
      <Show condition={binding.actionType === "remap"}>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-4 font-bold text-xl">
            <span className="text-muted-foreground">→</span>
            <Conditional condition={binding.targetKeys.length > 0}>
              <Then as="div" className="flex gap-1">
                <Mapped value={binding.targetKeys.map((vk) => ({ id: vk }))}>
                  {({ id: vk }) => (
                    <KeyDisplay
                      key={vk}
                      keyboardLayout={keyboardLayout}
                      variant="primary"
                      vkCode={vk}
                    />
                  )}
                </Mapped>
              </Then>
              <Else
                as="span"
                className="rounded-md border border-muted-foreground border-dashed px-4 py-2 text-muted-foreground"
              >
                キーを長押して選択
              </Else>
            </Conditional>
          </div>
          <Button onClick={binding.clearTargetKeys} size="sm" variant="ghost">
            クリア
          </Button>
        </div>
      </Show>

      {/* レイヤー選択 */}
      <Show
        condition={
          binding.actionType === "layerToggle" ||
          binding.actionType === "layerMomentary"
        }
      >
        <LayerSelector
          description={getLayerDescription(binding.actionType)}
          layers={layers}
          onLayerChange={binding.setSelectedLayerId}
          selectedLayerId={binding.selectedLayerId}
        />
      </Show>

      {/* ボタン */}
      <div className="flex justify-end gap-2 pt-2">
        <Show condition={binding.hasExistingBinding}>
          <Button onClick={handleRemove} variant="destructive">
            削除
          </Button>
        </Show>
        <Button
          disabled={
            binding.actionType === "remap" && binding.targetKeys.length === 0
          }
          onClick={handleSave}
          variant="primary"
        >
          保存
        </Button>
      </div>
    </div>
  );
}
