import { ArrowRight, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TabsContent } from "@/components/ui/tabs";
import { getLayerDescription } from "@/utils/getLayerDescription";
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
import { Button } from "../atoms/button";
import { Icon } from "../atoms/icon";
import { Input } from "../atoms/input";
import { WithRemoveBadge } from "../atoms/removeBadge";
import { ToggleButton } from "../atoms/toggleButton";
import { HandleEmpty } from "../control/handleEmpty";
import { Mapped } from "../control/Mapped";
import { Show } from "../control/Show";
import {
  ActionSelector,
  ActionSelectorContent,
} from "../molecules/actionSelector";
import { KeyDisplay } from "../molecules/keyDisplay";
import { LayerSelector } from "../molecules/layerSelector";
import { MousePositionInput } from "../molecules/mousePositionInput";
import { TimingInput } from "../molecules/timingInput";
import { TriggerTabs } from "../molecules/triggerTabs";
import { HStack, VStack } from "../template/flex";

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

const MOUSE_CAPTURE_COUNTDOWN_START = 3;
const COUNTDOWN_INTERVAL_MS = 1000;
const DEFAULT_CURSOR_RETURN_DELAY_MS = 1000;

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
  const [mouseButton, setMouseButton] = useState<"left" | "right" | "middle">(
    "left"
  );
  const [clickCount, setClickCount] = useState<number>(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [cursorReturnDelayMs, setCursorReturnDelayMs] = useState<number>(
    DEFAULT_CURSOR_RETURN_DELAY_MS
  );

  const {
    state: {
      actionType,
      selectedLayerId,
      targetKeys,
      hasExistingBinding,
      mouseX: loadedMouseX,
      mouseY: loadedMouseY,
      mouseButton: loadedMouseButton,
      clickCount: loadedClickCount,
      cursorReturnDelayMs: loadedCursorReturnDelayMs,
    },
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
      const timingObj: Record<string, number | undefined> = {
        hold: holdThresholdMs,
        doubleTap: tapIntervalMs,
      };
      const timing = timingObj[trigger];
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
        handleSaveWithTiming(trigger, {
          ...action,
          x: mouseX,
          y: mouseY,
          button: mouseButton,
          clickCount,
        });
      } else if (action.type === "cursorReturn") {
        handleSaveWithTiming(trigger, {
          ...action,
          delayMs: cursorReturnDelayMs,
        });
      } else {
        handleSaveWithTiming(trigger, action);
      }
    },
    [
      handleSaveWithTiming,
      mouseX,
      mouseY,
      mouseButton,
      clickCount,
      cursorReturnDelayMs,
    ]
  );

  const {
    newTargetKeys,
    canSave,
    addHoldKey,
    removeHoldKey,
    removeKey,
    resetState,
    handleSave,
    handleRemove,
  } = useKeyEditorActions({
    state: { actionType, selectedLayerId, targetKeys, hasExistingBinding },
    layerId,
    targetVk,
    selectedTrigger,
    onSave: handleSaveAction,
    onRemove,
    onClose,
  });

  const { handleHoldKeyDown, handleHoldKeyUp } = useKeyHoldAction({
    targetKey: VK.ENTER,
  });

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
          if (!targetKeys.includes(VK.ENTER)) {
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
    setCountdown(MOUSE_CAPTURE_COUNTDOWN_START);

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
    }, COUNTDOWN_INTERVAL_MS);
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
    if (loadedCursorReturnDelayMs !== undefined) {
      setCursorReturnDelayMs(loadedCursorReturnDelayMs);
    }
  }, [
    loadedMouseX,
    loadedMouseY,
    loadedMouseButton,
    loadedClickCount,
    loadedCursorReturnDelayMs,
  ]);

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
          gap={2}
          onActionTypeChange={setActionType}
          triggerType={selectedTrigger}
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
                  label="クリア"
                  onClick={() => {
                    resetState();
                    clearTargetKeys();
                  }}
                  variant="ghost"
                />
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
              <p className="text-muted-foreground text-sm">
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
            </VStack>
          </ActionSelectorContent>

          <ActionSelectorContent value="mouseClick">
            <VStack className="w-full justify-center" gap={4}>
              <p className="text-muted-foreground text-sm">
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
              >
                <VStack className="h-full justify-around" gap={2}>
                  <ToggleButton
                    className="w-full"
                    labels={{
                      left: "左クリック",
                      middle: "中クリック",
                      right: "右クリック",
                    }}
                    onChange={setMouseButton}
                    options={["left", "middle", "right"] as const}
                    value={mouseButton}
                  />

                  <ToggleButton
                    className="w-full"
                    labels={{
                      1: "シングル",
                      2: "ダブル",
                    }}
                    onChange={setClickCount}
                    options={[1, 2] as const}
                    value={clickCount}
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
                  val !== undefined && setCursorReturnDelayMs(val)
                }
                setFocused={setIsInputFocused}
                value={cursorReturnDelayMs}
              />
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
          <Button
            label="削除"
            onClick={handleRemove}
            size="default"
            variant="destructive"
          />
        </Show>
        <Button
          disabled={!canSave}
          label="保存"
          onClick={handleSave}
          size="default"
          variant="default"
        />
      </HStack>
    </VStack>
  );
}
