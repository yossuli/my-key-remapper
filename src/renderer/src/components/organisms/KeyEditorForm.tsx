import { useCallback, useEffect, useState } from "react";
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
import { useMousePosition } from "../../hooks/useMousePosition";
import type { LayoutType } from "../../types";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Select } from "../atoms/Select";
import { Mapped } from "../control/Mapped";
import { Show } from "../control/Show";
import { ActionSelector, ActionSelectorContent } from "../molecules/ActionSelector";
import { KeyDisplay } from "../molecules/KeyDisplay";
import { MousePositionInput } from "../molecules/MousePositionInput";
import { TimingInput } from "../molecules/TimingInput";

import { TabsContent, TriggerTabs } from "../molecules/TriggerTabs";
import { HStack, VStack } from "../template/Flex";
import { ArrowRight, MousePointer2, Plus } from "lucide-react";
import { getLayerDescription } from "@/utils/getLayerDescription";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WithRemoveBadge } from "../atoms/RemoveBadge";
import { HandleEmpty } from "../control/HandleEmpty";
import { LayerSelector } from "../molecules/LayerSelector";
import { Input } from "../atoms/Input";


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
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [mouseButton, setMouseButton] = useState<"left" | "right" | "middle">("left");
  const [clickCount, setClickCount] = useState<number>(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    state: { actionType, selectedLayerId, targetKeys, hasExistingBinding, mouseX: loadedMouseX, mouseY: loadedMouseY, mouseButton: loadedMouseButton, clickCount: loadedClickCount },
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
      const timing =
        trigger === "hold"
          ? holdThresholdMs
          : trigger === "doubleTap"
            ? tapIntervalMs
            : undefined;
      onSave(trigger, action, timing);
    },
    [holdThresholdMs, tapIntervalMs, onSave]
  );

  const handleSaveAction = useCallback(
    (trigger: TriggerType, action: Action) => {
      // mouseMoveアクションの場合は座標を設定
      if (action.type === "mouseMove") {
        handleSaveWithTiming(trigger, { ...action, x: mouseX, y: mouseY });
      } else if (action.type === "mouseClick") {
        handleSaveWithTiming(trigger, { ...action, x: mouseX, y: mouseY, button: mouseButton, clickCount });
      } else {
        handleSaveWithTiming(trigger, action);
      }
    },
    [handleSaveWithTiming, mouseX, mouseY, mouseButton, clickCount]
  );

  const { newTargetKeys, canSave, addHoldKey, removeHoldKey, removeKey, resetState, handleSave, handleRemove } = useKeyEditorActions({ state: { actionType, selectedLayerId, targetKeys, hasExistingBinding }, layerId, targetVk, selectedTrigger, onSave: handleSaveAction, onRemove, onClose }); // biome-ignore format: 引数に関心はない

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
    if (!Number.isNaN(vk) && vk >= MIN_VK_CODE && vk <= MAX_VK_CODE) {
      addHoldKey(vk);
      setVkInputValue("");
    }
  };

  const { getCursorPosition } = useMousePosition();

  const handleGetMousePosition = (): void => {
    setIsCapturing(true);
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // カウントダウン終了後に座標を取得
          getCursorPosition().then((position) => {
            setMouseX(position.x);
            setMouseY(position.y);
            setIsCapturing(false);
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 読み込んだ設定で初期化
  useEffect(() => {
    if (loadedMouseX !== undefined) {
      setMouseX(loadedMouseX);
    }
    if (loadedMouseY !== undefined) {
      setMouseY(loadedMouseY);
    }
    if (loadedMouseButton !== undefined) {
      setMouseButton(loadedMouseButton);
    }
    if (loadedClickCount !== undefined) {
      setClickCount(loadedClickCount);
    }
  }, [loadedMouseX, loadedMouseY, loadedMouseButton, loadedClickCount]);

  return (
    <VStack className="px-6" gap={4}>
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
        gap={4}
        onTriggerChange={handleTriggerChange}
        selectedTrigger={selectedTrigger}
      >
        <ActionSelector
          actionType={actionType}
          onActionTypeChange={setActionType}
          triggerType={selectedTrigger}
          gap={2}
        >
          <ActionSelectorContent value="remap">
            <HStack
              className="flex-wrap justify-center font-bold text-xl"
              gap={4}
            >
              <KeyDisplay layout={layout} vkCode={targetVk} />
              <Icon icon={ArrowRight} size="md" />
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
              collapsible
              onValueChange={(val) => setShowVkInput(val === "vk-input")}
              type="single"
            >
              <AccordionItem className="border-none" value="vk-input">
                <AccordionTrigger className="justify-center text-muted-foreground text-xs hover:no-underline">
                  VKコードで直接指定
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center justify-center gap-1">
                    <Input
                      id="vk-direct-input"
                      input-className="w-16 font-mono text-center text-sm"
                      input-onChange={(e) => setVkInputValue(e.target.value)}
                      input-onKeyDown={(e) =>
                        e.key === "Enter" && handleVkInputConfirm()
                      }
                      input-placeholder="VK"
                      input-type="number"
                      input-value={vkInputValue}
                      setFocused={setIsInputFocused}
                    />
                    <Button onClick={handleVkInputConfirm} variant="ghost">
                      <Icon icon={Plus} />
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
              <p className="text-sm text-muted-foreground">
                マウスカーソルを指定座標に移動します
              </p>

              <MousePositionInput
                countdown={countdown}
                idPrefix="mouse"
                isCapturing={isCapturing}
                mouseX={mouseX}
                mouseY={mouseY}
                onGetPosition={handleGetMousePosition}
                onMouseXChange={setMouseX}
                onMouseYChange={setMouseY}
                setFocused={setIsInputFocused}
              />

              <p className="text-xs text-muted-foreground">
                {isCapturing
                  ? "マウスを目的の位置に移動してください..."
                  : `設定座標: (${mouseX}, ${mouseY})`}
              </p>
            </VStack>
          </ActionSelectorContent>

          <ActionSelectorContent value="mouseClick">
            <VStack gap={4} className="w-full">
              <p className="text-sm text-muted-foreground">
                指定座標をクリックします
              </p>

              <MousePositionInput
                countdown={countdown}
                idPrefix="click"
                isCapturing={isCapturing}
                mouseX={mouseX}
                mouseY={mouseY}
                onGetPosition={handleGetMousePosition}
                onMouseXChange={setMouseX}
                onMouseYChange={setMouseY}
                setFocused={setIsInputFocused}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  id="mouse-button"
                  label="ボタン"
                  onValueChange={(value) => setMouseButton(value as any)}
                  options={[
                    { id: "left", value: "left", label: "左クリック" },
                    { id: "middle", value: "middle", label: "中クリック" },
                    { id: "right", value: "right", label: "右クリック" },
                  ]}
                  select-value={mouseButton}
                />

                <Select
                  id="click-count"
                  label="回数"
                  onValueChange={(value) => setClickCount(Number(value))}
                  options={[
                    { id: 1, value: "1", label: "シングル" },
                    { id: 2, value: "2", label: "ダブル" },
                  ]}
                  select-value={clickCount.toString()}
                />
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                設定: ({mouseX}, {mouseY}) を
                {mouseButton === "left" ? "左" : mouseButton === "middle" ? "中" : "右"}
                クリック × {clickCount}
              </p>
            </VStack>
          </ActionSelectorContent>
        </ActionSelector>

        <TabsContent value="hold">
          <TimingInput
            defaultValue={defaultHoldThresholdMs}
            id="holdThreshold"
            label="判定時間 (ms)"
            onValueChange={setHoldThresholdMs}
            setFocused={setIsInputFocused}
            value={holdThresholdMs}
          />
        </TabsContent>

        <TabsContent value="doubleTap">
          <TimingInput
            defaultValue={defaultTapIntervalMs}
            id="tapInterval"
            label="タップ間隔 (ms)"
            onValueChange={setTapIntervalMs}
            setFocused={setIsInputFocused}
            value={tapIntervalMs}
          />
        </TabsContent>
      </TriggerTabs>
      <HStack className="justify-end" gap={2}>
        <Show condition={hasExistingBinding}>
          <Button onClick={handleRemove} size="default" variant="destructive">
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
  );
}
