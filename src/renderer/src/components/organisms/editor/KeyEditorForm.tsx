// TODO - 一旦コミットしてる節がある
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Show } from "@/components/control/Show";
import { KeyDisplay } from "@/components/molecules/display/KeyDisplay";
import { TriggerTabs } from "@/components/molecules/forms/TriggerTabs";
import { ActionSettingsSection } from "@/components/organisms/editor/ActionSettingsSection";
import { TimingSettingsSection } from "@/components/organisms/editor/TimingSettingsSection";
import { HStack, VStack } from "@/components/template/Flex";
import { useBindingConfig } from "@/hooks/useBindingConfig";
import { useEventHandler } from "@/hooks/useEventHandler";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { useKeyEditorActions } from "@/hooks/useKeyEditorAction";
import { useKeyHoldAction } from "@/hooks/useKeyHoldAction";
import { useMousePosition } from "@/hooks/useMousePosition";
import type { LayoutType } from "@/types";
import { VK } from "../../../../../shared/constants/vk";
import type {
  Action,
  Layer,
  RemapAction,
  TriggerType,
} from "../../../../../shared/types/remapConfig";

const MOUSE_CAPTURE_COUNTDOWN_START = 3;
const COUNTDOWN_INTERVAL_MS = 1000;
const DEFAULT_CURSOR_RETURN_DELAY_MS = 1000;
const DEFAULT_HOLD_THRESHOLD_MS = 200;
const DEFAULT_TAP_INTERVAL_MS = 300;
const DEFAULT_REPEAT_DELAY_MS = 500;
const DEFAULT_REPEAT_INTERVAL_MS = 100;

// キーエディタUI制御関連
export interface KeyEditorUIHandlers {
  setIsInputFocused: (focused: boolean) => void;
}

// キーエディタUI状態 (現在は空)

// マウス座標の状態
export interface MousePosition {
  x: number;
  y: number;
}

// マウスキャプチャの状態
export interface MouseCaptureState {
  isCapturing: boolean;
  countdown: number;
}

// マウス操作関連
export interface MouseHandlers {
  setMouseX: (x: number) => void;
  setMouseY: (y: number) => void;
  setMouseButton: (button: "left" | "right" | "middle") => void;
  setClickCount: (count: number) => void;
  setCursorReturnDelayMs: (ms: number) => void;
  onGetMousePosition: () => void;
}

// マウス状態関連
export interface MouseState extends MousePosition, MouseCaptureState {
  button: "left" | "right" | "middle";
  clickCount: number;
  cursorReturnDelayMs: number;
}

// リピート設定のグループ
export interface RepeatSettings
  extends Pick<RemapAction, "repeat" | "repeatDelayMs" | "repeatIntervalMs"> {
  onRepeatChange: (repeat: boolean, delay?: number, interval?: number) => void;
}

interface KeyEditorFormProps {
  targetVk: number;
  layerId: string;
  layout: LayoutType;
  layers: Layer[];
  trigger: TriggerType;
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
  trigger,
  onSave,
  onRemove,
  onClose,
}: KeyEditorFormProps) {
  const { globalSettings } = useGlobalSettings();
  const defaultHoldThresholdMs =
    globalSettings?.defaultHoldThresholdMs ?? DEFAULT_HOLD_THRESHOLD_MS;
  const defaultTapIntervalMs =
    globalSettings?.defaultTapIntervalMs ?? DEFAULT_TAP_INTERVAL_MS;
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>(trigger);
  const [_isInputFocused, setIsInputFocused] = useState(false);
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
      repeat: loadedRepeat,
      repeatDelayMs: loadedRepeatDelayMs,
      repeatIntervalMs: loadedRepeatIntervalMs,
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

  // リピート設定
  const [repeat, setRepeat] = useState(false);
  const [repeatDelayMs, setRepeatDelayMs] = useState<number | undefined>(
    DEFAULT_REPEAT_DELAY_MS
  );
  const [repeatIntervalMs, setRepeatIntervalMs] = useState<number | undefined>(
    DEFAULT_REPEAT_INTERVAL_MS
  );

  // 読み込んだタイミング設定で初期化
  useEffect(() => {
    if (existingTiming?.holdThresholdMs !== undefined) {
      setHoldThresholdMs(existingTiming.holdThresholdMs);
    }
    if (existingTiming?.tapIntervalMs !== undefined) {
      setTapIntervalMs(existingTiming.tapIntervalMs);
    }
  }, [existingTiming]);

  const handleSaveWithTiming = useCallback(
    (t: TriggerType, action: Action) => {
      const timingObj: Record<string, number | undefined> = {
        hold: holdThresholdMs,
        doubleTap: tapIntervalMs,
      };
      const timing = timingObj[t];
      onSave(t, action, timing);
    },
    [holdThresholdMs, tapIntervalMs, onSave]
  );

  const handleSaveAction = useCallback(
    (t: TriggerType, action: Action) => {
      if (action.type === "mouseMove") {
        handleSaveWithTiming(t, { ...action, x: mouseX, y: mouseY });
      } else if (action.type === "mouseClick") {
        handleSaveWithTiming(t, {
          ...action,
          x: mouseX,
          y: mouseY,
          button: mouseButton,
          clickCount,
        });
      } else if (action.type === "cursorReturn") {
        handleSaveWithTiming(t, {
          ...action,
          delayMs: cursorReturnDelayMs,
        });
      } else if (action.type === "remap") {
        handleSaveWithTiming(t, {
          ...action,
          repeat,
          repeatDelayMs,
          repeatIntervalMs,
        });
      } else {
        handleSaveWithTiming(t, action);
      }
    },
    [
      handleSaveWithTiming,
      mouseX,
      mouseY,
      mouseButton,
      clickCount,
      cursorReturnDelayMs,
      repeat,
      repeatDelayMs,
      repeatIntervalMs,
    ]
  );

  const keyEditorActions = useKeyEditorActions({
    state: { actionType, selectedLayerId, targetKeys, hasExistingBinding },
    layerId,
    targetVk,
    selectedTrigger,
    onSave: handleSaveAction,
    onRemove,
    onClose,
    onClearTargetKeys: clearTargetKeys,
  });

  const { handleSave, handleRemove, canSave } = keyEditorActions;

  // --- Enter長押し保存の復元 ---
  const { handleHoldKeyDown, handleHoldKeyUp } = useKeyHoldAction({
    targetKey: VK.ENTER,
    holdMs: 800,
  });

  useEventHandler(
    [
      {
        type: "keydown",
        handler: (e) => {
          handleHoldKeyDown(e.keyCode, {
            onHold: handleSave,
          });
        },
      },
      {
        type: "keyup",
        handler: (e) => {
          handleHoldKeyUp(e.keyCode, {
            onTap: () => {
              if (actionType === "remap") {
                addTargetKey(VK.ENTER);
              }
            },
            onHold: handleSave,
          });
        },
      },
    ],
    [handleHoldKeyDown, handleHoldKeyUp, handleSave, actionType, addTargetKey],
    { enabled: !_isInputFocused }
  );

  const handleTriggerChange = (newTrigger: TriggerType) => {
    setSelectedTrigger(newTrigger);
    loadBindingForTrigger(newTrigger);
  };

  const handleRepeatChange = (
    newRepeat: boolean,
    newDelay?: number,
    newInterval?: number
  ) => {
    setRepeat(newRepeat);
    if (newDelay !== undefined) {
      setRepeatDelayMs(newDelay);
    }
    if (newInterval !== undefined) {
      setRepeatIntervalMs(newInterval);
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

  useEffect(() => {
    if (loadedRepeat !== undefined) {
      setRepeat(loadedRepeat);
    } else {
      setRepeat(false);
    }
    if (loadedRepeatDelayMs !== undefined) {
      setRepeatDelayMs(loadedRepeatDelayMs);
    }
    if (loadedRepeatIntervalMs !== undefined) {
      setRepeatIntervalMs(loadedRepeatIntervalMs);
    }
  }, [loadedRepeat, loadedRepeatDelayMs, loadedRepeatIntervalMs]);

  const keyEditorUIHandlers: KeyEditorUIHandlers = {
    setIsInputFocused,
  };

  const mouseHandlers: MouseHandlers = {
    setMouseX,
    setMouseY,
    setMouseButton,
    setClickCount,
    setCursorReturnDelayMs,
    onGetMousePosition: handleGetMousePosition,
  };

  const mouseState: MouseState = {
    x: mouseX,
    y: mouseY,
    button: mouseButton,
    clickCount,
    isCapturing,
    countdown,
    cursorReturnDelayMs,
  };

  const repeatSettings: RepeatSettings = {
    repeat,
    repeatDelayMs,
    repeatIntervalMs,
    onRepeatChange: handleRepeatChange,
  };

  return (
    <VStack className="px-6" gap={4}>
      <div className="flex items-center justify-center gap-4 font-bold text-2xl">
        <KeyDisplay layout={layout} vkCode={targetVk} />
        <Show condition={targetKeys.length > 0}>
          <Icon icon={ArrowRight} size="md" />
          {targetKeys.map((vk) => (
            <KeyDisplay
              key={vk}
              layout={layout}
              variant="primary"
              vkCode={vk}
            />
          ))}
        </Show>
      </div>

      <TriggerTabs
        gap={4}
        onTriggerChange={handleTriggerChange}
        selectedTrigger={selectedTrigger}
      >
        {/* アクション設定セクション */}
        <ActionSettingsSection
          actionType={actionType}
          keyEditorActions={keyEditorActions}
          keyEditorUIHandlers={keyEditorUIHandlers}
          layers={layers}
          layout={layout}
          mouseHandlers={mouseHandlers}
          mouseState={mouseState}
          repeatSettings={repeatSettings}
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
