import { useState } from "react";
import type {
  Action,
  Layer,
  TriggerType,
} from "../../../../shared/types/remapConfig";
import { useBindingConfig } from "../../hooks/useBindingConfig";
import { useKeyEditorActions } from "../../hooks/useKeyEditorAction";
import { useRemapKeySelection } from "../../hooks/useRemapKeySelection";
import type { LayoutType } from "../../types";
import { getLayerDescription } from "../../utils/getLayerDescription";
import { Button } from "../atoms/Button";
import { WithRemoveBadge } from "../atoms/RemoveBadge";
import { Mapped } from "../control/Mapped";
import { Show } from "../control/Show";
import { Conditional, Else, Then } from "../control/Ternary";
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
  // トリガー選択状態
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("tap");

  // バインディング設定
  const binding = useBindingConfig({
    targetVk,
    layerId,
    defaultLayerId: layers[0]?.id || "",
  });
  const { actionType, selectedLayerId, targetKeys, hasExistingBinding } =
    binding.state;
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

  // リマップキー選択（Enter長押しで保存も担当）
  useRemapKeySelection({
    enabled: actionType === "remap",
    targetKeys,
    onAddKey: binding.addTargetKey,
    onEnterHold: handleSave,
  });
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
        onActionTypeChange={binding.setActionType}
        triggerType={selectedTrigger}
      />

      {/* リマップ設定 */}
      <Show condition={actionType === "remap"}>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-4 font-bold text-xl">
            <KeyDisplay layout={layout} vkCode={targetVk} />
            <span className="text-muted-foreground">→</span>
            <Conditional condition={targetKeys.length > 0}>
              <Then as="div" className="flex gap-1">
                <Mapped value={targetKeys.map((vk) => ({ id: vk }))}>
                  {({ id: vk }) => (
                    <WithRemoveBadge
                      onRemove={() => {
                        // TODO: 個別キー削除のロジックを実装
                        console.log("Remove key:", vk);
                      }}
                    >
                      <KeyDisplay
                        layout={layout}
                        variant="primary"
                        vkCode={vk}
                      />
                    </WithRemoveBadge>
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
          actionType === "layerToggle" || actionType === "layerMomentary"
        }
      >
        <LayerSelector
          description={getLayerDescription(actionType)}
          layers={layers}
          onLayerChange={binding.setSelectedLayerId}
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
        <Button
          disabled={actionType === "remap" && targetKeys.length === 0}
          onClick={handleSave}
          variant="primary"
        >
          保存
        </Button>
      </div>
    </div>
  );
}
