import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { VK } from "../../../../../shared/constants/vk";
import type {
  Action,
  Layer,
  TriggerType,
} from "../../../../../shared/types/remapConfig";
import { useBindingConfig } from "../../../hooks/useBindingConfig";
import { useKeyEditorActions } from "../../../hooks/useKeyEditorAction";
import { useKeyEventInput } from "../../../hooks/useKeyEventInput";
import { useKeyHoldAction } from "../../../hooks/useKeyHoldAction";
import { useMousePosition } from "../../../hooks/useMousePosition";
import type { LayoutType } from "../../../types";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { Mapped } from "../../control/Mapped";
import { Show } from "../../control/Show";
import { KeyDisplay } from "../../molecules/display/KeyDisplay";
import { TriggerTabs } from "../../molecules/forms/TriggerTabs";
import { HStack, VStack } from "../../template/Flex";
import { ActionSettingsSection } from "./ActionSettingsSection";
import { TimingSettingsSection } from "./TimingSettingsSection";

const MOUSE_CAPTURE_COUNTDOWN_START = 3;
const COUNTDOWN_INTERVAL_MS = 1000;
const DEFAULT_CURSOR_RETURN_DELAY_MS = 1000;

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

  const { getCursorPosition } = useMousePosition();

  const handleGetMousePosition = (): void => {
    setIsCapturing(true);
    setCountdown(MOUSE_CAPTURE_COUNTDOWN_START);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
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
      {/* 現在のマッピング表示 */}
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

      {/* トリガーとアクション設定 */}
      <TriggerTabs
        gap={4}
        onTriggerChange={handleTriggerChange}
        selectedTrigger={selectedTrigger}
      >
        {/* アクション設定セクション */}
        <ActionSettingsSection
          actionType={actionType}
          keyEditorActions={{
            addHoldKey,
            removeKey,
            resetState,
            clearTargetKeys,
          }}
          keyEditorState={{ showVkInput, vkInputValue }}
          keyEditorUIHandlers={{
            setShowVkInput,
            setVkInputValue,
            setIsInputFocused,
          }}
          layers={layers}
          layout={layout}
          mouseHandlers={{
            setMouseX,
            setMouseY,
            setMouseButton,
            setClickCount,
            setCursorReturnDelayMs,
            onGetMousePosition: handleGetMousePosition,
          }}
          mouseState={{
            x: mouseX,
            y: mouseY,
            button: mouseButton,
            clickCount,
            isCapturing,
            countdown,
            cursorReturnDelayMs,
          }}
          newTargetKeys={newTargetKeys}
          selectedLayerId={selectedLayerId}
          selectedTrigger={selectedTrigger}
          setActionType={setActionType}
          setSelectedLayerId={setSelectedLayerId}
          targetVk={targetVk}
        />

        {/* タイミング設定セクション */}
        <TimingSettingsSection
          defaultHoldThresholdMs={defaultHoldThresholdMs}
          defaultTapIntervalMs={defaultTapIntervalMs}
          holdThresholdMs={holdThresholdMs}
          selectedTrigger={selectedTrigger}
          setHoldThresholdMs={setHoldThresholdMs}
          setIsInputFocused={setIsInputFocused}
          setTapIntervalMs={setTapIntervalMs}
          tapIntervalMs={tapIntervalMs}
        />
      </TriggerTabs>

      {/* 保存/削除ボタン */}
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
