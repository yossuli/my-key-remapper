import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Mapped } from "@/components/control/Mapped";
import { Show } from "@/components/control/Show";
import { KeyDisplay } from "@/components/molecules/display/KeyDisplay";
import { TriggerTabs } from "@/components/molecules/forms/TriggerTabs";
import { ActionSettingsSection } from "@/components/organisms/editor/ActionSettingsSection";
import { TimingSettingsSection } from "@/components/organisms/editor/TimingSettingsSection";
import { HStack, VStack } from "@/components/template/Flex";
import { useBindingConfig } from "@/hooks/useBindingConfig";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { useKeyEditorActions } from "@/hooks/useKeyEditorAction";
import { useKeyEventInput } from "@/hooks/useKeyEventInput";
import { useKeyHoldAction } from "@/hooks/useKeyHoldAction";
import { useMousePosition } from "@/hooks/useMousePosition";
import type { LayoutType } from "@/types";
import { VK } from "../../../../../shared/constants/vk";
import type {
  Action,
  Layer,
  TriggerType,
} from "../../../../../shared/types/remapConfig";

const MOUSE_CAPTURE_COUNTDOWN_START = 3;
const COUNTDOWN_INTERVAL_MS = 1000;
const DEFAULT_CURSOR_RETURN_DELAY_MS = 1000;
const DEFAULT_HOLD_THRESHOLD_MS = 200;
const DEFAULT_TAP_INTERVAL_MS = 300;

// キーエディタ操作関連
export type KeyEditorUIActions = Pick<
  ReturnType<typeof useKeyEditorActions>,
  "addHoldKey" | "removeKey" | "resetState" | "handleSave" | "handleRemove"
> &
  Pick<ReturnType<typeof useBindingConfig>, "clearTargetKeys">;

// キーエディタUI制御関連
export interface KeyEditorUIHandlers {
  setShowVkInput: (show: boolean) => void;
  setVkInputValue: (value: string) => void;
  setIsInputFocused: (focused: boolean) => void;
}

// キーエディタUI状態関連
export interface KeyEditorUIState {
  showVkInput: boolean;
  vkInputValue: string;
}

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
  targetVk, // 🆕 → 🔥 (I. Key Editor Modal)
  layerId, // ∈ → 🧩🔥 (A. Layer Management Flow)
  layout, // 🆕 → 🧩🔥 (C. UI Configuration)
  layers, // ∈ → 🧩🔥 (A. Layer Management Flow)
  onSave, // 🆕 → 🔥 (I. Key Editor Modal)
  onRemove, // 🆕 → 🔥 (I. Key Editor Modal)
  onClose, // 🆕 → 🔥 (I. Key Editor Modal)
}: KeyEditorFormProps) {
  const { globalSettings } = useGlobalSettings();
  const defaultHoldThresholdMs =
    globalSettings?.defaultHoldThresholdMs ?? DEFAULT_HOLD_THRESHOLD_MS;
  const defaultTapIntervalMs =
    globalSettings?.defaultTapIntervalMs ?? DEFAULT_TAP_INTERVAL_MS;
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

  const keyEditorActions: KeyEditorUIActions = {
    addHoldKey,
    removeKey,
    resetState,
    clearTargetKeys,
    handleSave,
    handleRemove,
  };

  const keyEditorUIHandlers: KeyEditorUIHandlers = {
    setShowVkInput,
    setVkInputValue,
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

  const keyEditorState: KeyEditorUIState = {
    showVkInput,
    vkInputValue,
  };

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
          keyEditorActions={keyEditorActions}
          keyEditorState={keyEditorState}
          keyEditorUIHandlers={keyEditorUIHandlers}
          layers={layers}
          layout={layout}
          mouseHandlers={mouseHandlers}
          mouseState={mouseState}
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
