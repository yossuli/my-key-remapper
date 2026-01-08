import { ArrowRight, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { MAX_VK_CODE, MIN_VK_CODE, VK } from "../../../../shared/constants/vk";
import type {
  Action,
  KeyTimingConfig,
  Layer,
  TriggerType,
} from "../../../../shared/types/remapConfig";
import { useBindingConfig } from "../../hooks/useBindingConfig";
import { useKeyEditorActions } from "../../hooks/useKeyEditorAction";
import { useKeyEventInput } from "../../hooks/useKeyEventInput";
import { useKeyHoldAction } from "../../hooks/useKeyHoldAction";
import type { LayoutType } from "../../types";
import { getLayerDescription } from "../../utils/getLayerDescription";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Input } from "../atoms/Input";
import { WithRemoveBadge } from "../atoms/RemoveBadge";
import { HandleEmpty } from "../control/HandleEmpty";
import { Mapped } from "../control/Mapped";
import { Show } from "../control/Show";
import { ActionTypeSelector } from "../molecules/ActionTypeSelector";
import { KeyDisplay } from "../molecules/KeyDisplay";
import { LayerSelector } from "../molecules/LayerSelector";
import { TimingConfig } from "../molecules/TimingConfig";
import { TriggerTabs } from "../molecules/TriggerTabs";
import { Column, Row } from "../template/Flex";

interface KeyEditorFormProps {
  targetVk: number;
  layerId: string;
  layout: LayoutType;
  layers: Pick<Layer, "id">[];
  trigger: TriggerType;
  /** 既存のタイミング設定（編集時に読み込む） */
  existingTiming?: KeyTimingConfig;
  onSave: (
    trigger: TriggerType,
    action: Action,
    timing?: KeyTimingConfig
  ) => void;
  onRemove: (trigger: TriggerType) => void;
  onClose: () => void;
}

export function KeyEditorForm({
  targetVk,
  layerId,
  layout,
  layers,
  existingTiming,
  onSave,
  onRemove,
  onClose,
}: KeyEditorFormProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("tap");
  const [holdThresholdMs, setHoldThresholdMs] = useState<number | undefined>(
    existingTiming?.holdThresholdMs
  );
  const [tapIntervalMs, setTapIntervalMs] = useState<number | undefined>(
    existingTiming?.tapIntervalMs
  );
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showVkInput, setShowVkInput] = useState(false);
  const [vkInputValue, setVkInputValue] = useState("");

  const {
    state: { actionType, selectedLayerId, targetKeys, hasExistingBinding },
    setSelectedLayerId,
    loadBindingForTrigger,
    clearTargetKeys,
    setActionType,
  } = useBindingConfig({
    targetVk,
    layerId,
    defaultLayerId: layers[0]?.id || "",
  });

  const handleSaveWithTiming = useCallback(
    (trigger: TriggerType, action: Action) => {
      const timing: KeyTimingConfig | undefined =
        holdThresholdMs !== undefined || tapIntervalMs !== undefined
          ? { holdThresholdMs, tapIntervalMs }
          : undefined;
      onSave(trigger, action, timing);
    },
    [holdThresholdMs, tapIntervalMs, onSave]
  );

  const { newTargetKeys, canSave, addHoldKey, removeHoldKey, removeKey, resetState, handleSave, handleRemove } = useKeyEditorActions({ state: { actionType, selectedLayerId, targetKeys, hasExistingBinding }, layerId, targetVk, selectedTrigger, onSave: handleSaveWithTiming, onRemove, onClose }); // biome-ignore format: 引数に関心はない

  const { handleHoldKeyDown, handleHoldKeyUp } = useKeyHoldAction({ targetKey: VK.ENTER }); // biome-ignore format: 引数に関心はない

  const onKeyDown = useCallback(
    (e: number) => {
      if (actionType !== "remap") {
        return;
      }

      handleHoldKeyDown(e, {
        onOtherKeyDown() {
          addHoldKey(e);
        },
        onHold() {
          handleSave();
        },
      });
    },
    [actionType, handleHoldKeyDown, handleSave, addHoldKey]
  );

  const onKeyUp = useCallback(
    (e: number) => {
      handleHoldKeyUp(e, {
        onTap() {
          const enterKeyCode = 13;
          if (!targetKeys.includes(enterKeyCode)) {
            addHoldKey(e);
          }
        },
        onOtherKeyUp() {
          removeHoldKey(e);
        },
      });
    },
    [handleHoldKeyUp, targetKeys, addHoldKey, removeHoldKey]
  );

  useKeyEventInput({
    enabled: !isInputFocused,
    onKeyDown,
    onKeyUp,
  });

  const handleTriggerChange = (newTrigger: TriggerType) => {
    setSelectedTrigger(newTrigger);
    loadBindingForTrigger(newTrigger);
  };

  const handleVkInputConfirm = () => {
    const vk = Number.parseInt(vkInputValue, 10);
    console.log(vk);
    if (!Number.isNaN(vk) && vk >= MIN_VK_CODE && vk <= MAX_VK_CODE) {
      addHoldKey(vk);
      setVkInputValue("");
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-center gap-4 font-bold text-2xl">
        <KeyDisplay layout={layout} vkCode={targetVk} />
        <Show condition={targetKeys.length > 0}>
          <Icon icon={ArrowRight} />
          <Mapped value={targetKeys.map((vk) => ({ id: vk }))}>
            {({ id: vk }) => (
              <KeyDisplay layout={layout} variant="primary" vkCode={vk} />
            )}
          </Mapped>
        </Show>
      </div>
      <TriggerTabs
        onTriggerChange={handleTriggerChange}
        selectedTrigger={selectedTrigger}
      />
      <ActionTypeSelector
        actionType={actionType}
        onActionTypeChange={setActionType}
        triggerType={selectedTrigger}
      />
      <Show condition={actionType === "remap"}>
        <div className="space-y-4 py-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 font-bold text-xl">
            <KeyDisplay layout={layout} vkCode={targetVk} />
            <Icon icon={ArrowRight} />
            <div className="flex flex-wrap items-center gap-2">
              <HandleEmpty
                array={newTargetKeys.map((vk) => ({ id: vk }))}
                empty={
                  <span className="rounded-md border border-muted-foreground border-dashed px-4 py-2 text-muted-foreground text-sm">
                    {showVkInput ? "数値を入力して追加" : "キーを長押して選択"}
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
          </div>

          <Column className="gap-2">
            <Row>
              <Button
                onClick={() => {
                  resetState();
                  clearTargetKeys();
                }}
                size="sm"
                variant="ghost"
              >
                クリア
              </Button>
              <Button
                className="text-muted-foreground text-xs"
                onClick={() => setShowVkInput(!showVkInput)}
                size="sm"
                variant="ghost"
              >
                {showVkInput ? "入力を閉じる" : "VKコードで直接指定"}
              </Button>
            </Row>
            <Show condition={showVkInput}>
              <div className="flex items-center gap-1">
                <Input
                  id="vk-direct-input"
                  input-className="w-16 font-mono text-center text-sm"
                  input-onBlur={() => setIsInputFocused(false)}
                  input-onChange={(e) => setVkInputValue(e.target.value)}
                  input-onFocus={() => setIsInputFocused(true)}
                  input-onKeyDown={(e) =>
                    e.key === "Enter" && handleVkInputConfirm()
                  }
                  input-placeholder="VK"
                  input-type="number"
                  input-value={vkInputValue}
                />
                <Button
                  onClick={handleVkInputConfirm}
                  size="sm"
                  variant="ghost"
                >
                  <Icon icon={Plus} size="sm" />
                </Button>
              </div>
            </Show>
          </Column>
        </div>
      </Show>
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
      <TimingConfig
        holdThresholdMs={holdThresholdMs}
        onFocusChange={setIsInputFocused}
        onHoldThresholdChange={setHoldThresholdMs}
        onTapIntervalChange={setTapIntervalMs}
        tapIntervalMs={tapIntervalMs}
      />
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
