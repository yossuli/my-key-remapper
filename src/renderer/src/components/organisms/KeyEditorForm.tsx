import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { MAX_VK_CODE, MIN_VK_CODE, VK } from "../../../../shared/constants/vk";
import type {
  Action,
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

import { TabsContent, TriggerTabs } from "../molecules/TriggerTabs";
import { HStack, VStack } from "../template/Flex";

interface KeyEditorFormProps {
  targetVk: number;
  layerId: string;
  layout: LayoutType;
  layers: Layer[];
  trigger: TriggerType;
  defaultHoldThresholdMs: number | undefined;
  defaultTapIntervalMs: number | undefined;
  onSave: (
    trigger: TriggerType,
    action: Action,
    timing?: number | null
  ) => void;
  onRemove: (trigger: TriggerType) => void;
  onClose: () => void;
}

export function KeyEditorForm({
  targetVk,
  layerId,
  layout,
  layers,
  defaultHoldThresholdMs,
  defaultTapIntervalMs,
  onSave,
  onRemove,
  onClose,
}: KeyEditorFormProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("tap");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showVkInput, setShowVkInput] = useState(false);
  const [vkInputValue, setVkInputValue] = useState("");

  const {
    state: { actionType, selectedLayerId, targetKeys, hasExistingBinding },
    existingTiming,
    setSelectedLayerId,
    loadBindingForTrigger,
    clearTargetKeys,
    setActionType,
  } = useBindingConfig({
    targetVk,
    layerId,
    defaultLayerId: layers[0]?.id || "",
  });

  const [holdThresholdMs, setHoldThresholdMs] = useState<number | undefined>(
    existingTiming?.holdThresholdMs
  );
  const [tapIntervalMs, setTapIntervalMs] = useState<number | undefined>(
    existingTiming?.tapIntervalMs
  );

  const handleSaveWithTiming = useCallback(
    (trigger: TriggerType, action: Action) => {
      // 両方がundefinedの場合はnullを送信して設定を削除
      const timing = trigger === "hold" ? holdThresholdMs : trigger === "doubleTap" ? tapIntervalMs : undefined;
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
    <div className="px-6">
      <div className="flex items-center justify-center gap-4 font-bold text-2xl">
        <KeyDisplay layout={layout} vkCode={targetVk} />
        <Show condition={targetKeys.length > 0}>
          <Icon icon={ArrowRight} size="md" />
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
      >
        <VStack gap={4}>
          <ActionTypeSelector
            actionType={actionType}
            onActionTypeChange={setActionType}
            triggerType={selectedTrigger}
          />

          <Show condition={actionType === "remap"}>
            <VStack gap={4}>
              <HStack
                gap={4}
                className="flex-wrap justify-center font-bold text-xl"
              >
                <KeyDisplay layout={layout} vkCode={targetVk} />
                <Icon icon={ArrowRight} size="md" />
                <div className="flex flex-wrap items-center gap-2">
                  <HandleEmpty
                    array={newTargetKeys.map((vk) => ({ id: vk }))}
                    empty={
                      <span className="rounded-md border border-muted-foreground border-dashed px-4 py-2 text-muted-foreground text-sm">
                        {showVkInput
                          ? "数値を入力して追加"
                          : "キーを長押して選択"}
                      </span>
                    }
                  >
                    {({ id: vk }) => (
                      <WithRemoveBadge
                        disabled={newTargetKeys.length === 1}
                        onRemove={() => removeKey(vk)}
                      >
                        <KeyDisplay
                          layout={layout}
                          variant="primary"
                          vkCode={vk}
                        />
                      </WithRemoveBadge>
                    )}
                  </HandleEmpty>
                </div>
                <Show condition={newTargetKeys.length > 0}>
                  <Button
                    onClick={() => {
                      resetState();
                      clearTargetKeys();
                    }}
                    variant="ghost"
                  >
                    クリア
                  </Button>
                </Show>
              </HStack>

              <Accordion
                type="single"
                collapsible
                onValueChange={(val) => setShowVkInput(val === "vk-input")}
              >
                <AccordionItem value="vk-input" className="border-none">
                  <AccordionTrigger className="justify-center text-xs text-muted-foreground hover:no-underline">
                    VKコードで直接指定
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center justify-center gap-1">
                      <Input
                        id="vk-direct-input"
                        setFocused={setIsInputFocused}
                        input-className="w-16 font-mono text-center text-sm"
                        input-onChange={(e) => setVkInputValue(e.target.value)}
                        input-onKeyDown={(e) =>
                          e.key === "Enter" && handleVkInputConfirm()
                        }
                        input-placeholder="VK"
                        input-type="number"
                        input-value={vkInputValue}
                      />
                      <Button onClick={handleVkInputConfirm} variant="ghost">
                        <Icon icon={Plus} />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </VStack>
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

          <TabsContent value="hold">
            <VStack gap={1}>
              <Input
                id="holdThreshold"
                setFocused={setIsInputFocused}
                input-min="1"
                input-size={0}
                input-onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setHoldThresholdMs(undefined);
                  } else {
                    const num = Number.parseInt(val, 10);
                    if (!Number.isNaN(num) && num > 0) setHoldThresholdMs(num);
                  }
                }}
                input-placeholder={String(defaultHoldThresholdMs ?? "-")}
                input-type="number"
                input-value={holdThresholdMs ?? ""}
                label="判定時間 (ms)"
              />
              <span className="text-muted-foreground text-xs">
                (デフォルト:{" "}
                {defaultHoldThresholdMs
                  ? `${defaultHoldThresholdMs}ms`
                  : "設定されていません"}
                )
              </span>
            </VStack>
          </TabsContent>

          <TabsContent value="doubleTap">
            <VStack gap={1}>
              <Input
                id="tapInterval"
                setFocused={setIsInputFocused}
                input-min="1"
                input-onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setTapIntervalMs(undefined);
                  } else {
                    const num = Number.parseInt(val, 10);
                    if (!Number.isNaN(num) && num > 0) setTapIntervalMs(num);
                  }
                }}
                input-type="number"
                input-value={tapIntervalMs ?? ""}
                label="タップ間隔 (ms)"
              />
              <span className="text-muted-foreground text-xs">
                (デフォルト:{" "}
                {defaultTapIntervalMs
                  ? `${defaultTapIntervalMs}ms`
                  : "設定されていません"}
                )
              </span>
            </VStack>
          </TabsContent>

          <HStack gap={2} className="justify-end">
            <Show condition={hasExistingBinding}>
              <Button
                onClick={handleRemove}
                size="default"
                variant="destructive"
              >
                削除
              </Button>
            </Show>
            <Button
              disabled={!canSave}
              onClick={handleSave}
              size="default"
              variant="default"
            >
              保存
            </Button>
          </HStack>
        </VStack>
      </TriggerTabs>
    </div>
  );
}
