import { VK } from "@shared/constants/vk";
import type { Action, ActionType, Layer } from "@shared/types/remapConfig";
import { objectiveDiscriminantPartialSwitch } from "@shared/utils/objectiveSwitch";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { ActionSettingsSection } from "@/components/organisms/editor/ActionSettingsSection";
import type {
  KeyEditorUIHandlers,
  MouseHandlers,
  MouseState,
  RepeatSettings,
} from "@/components/organisms/editor/KeyEditorForm";
import { HStack, VStack } from "@/components/template/Flex";
import { useEventHandler } from "@/hooks/useEventHandler";
import type { UseKeyEditorActionsReturn } from "@/hooks/useKeyEditorAction";
import { useKeyHoldAction } from "@/hooks/useKeyHoldAction";
import { useMousePosition } from "@/hooks/useMousePosition";
import type { LayoutType } from "@/types";

const MOUSE_CAPTURE_COUNTDOWN_START = 3;
const COUNTDOWN_INTERVAL_MS = 1000;
const DEFAULT_CURSOR_RETURN_DELAY_MS = 1000;
const DEFAULT_REPEAT_DELAY_MS = 500;
const DEFAULT_REPEAT_INTERVAL_MS = 100;
const DEFAULT_DELAY_MS = 500;

interface ActionStepEditorProps {
  initialAction?: Action;
  layers: Layer[];
  layout: LayoutType;
  onSave: (action: Action) => void;
  onCancel: () => void;
  currentMacroId?: string;
}

export function ActionStepEditor({
  initialAction,
  layers,
  layout,
  onSave,
  onCancel,
  currentMacroId,
}: ActionStepEditorProps) {
  // --- UI/Input State ---
  const [actionType, setActionType] = useState<ActionType>("remap");
  const [selectedLayerId, setSelectedLayerId] = useState<string>(
    layers[0]?.id ?? ""
  );
  const [targetKeys, setTargetKeys] = useState<number[]>([]);
  const [macroId, setMacroId] = useState<string>("");
  const [delayActionMs, setDelayActionMs] = useState<number>(DEFAULT_DELAY_MS);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // マウス関連
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

  // リピート
  const [repeat, setRepeat] = useState(false);
  const [repeatDelayMs, setRepeatDelayMs] = useState<number | undefined>(
    DEFAULT_REPEAT_DELAY_MS
  );
  const [repeatIntervalMs, setRepeatIntervalMs] = useState<number | undefined>(
    DEFAULT_REPEAT_INTERVAL_MS
  );

  // 初期値の反映
  useEffect(() => {
    if (initialAction) {
      setActionType(initialAction.type);

      objectiveDiscriminantPartialSwitch(
        {
          remap: (a) => {
            setTargetKeys(a.keys);
            setRepeat(a.repeat ?? false);
            setRepeatDelayMs(a.repeatDelayMs);
            setRepeatIntervalMs(a.repeatIntervalMs);
          },
          mouseMove: (a) => {
            setMouseX(a.x);
            setMouseY(a.y);
          },
          mouseClick: (a) => {
            setMouseX(a.x);
            setMouseY(a.y);
            setMouseButton(a.button);
            setClickCount(a.clickCount ?? 1);
          },
          cursorReturn: (a) => {
            setCursorReturnDelayMs(a.delayMs);
          },
          layerToggle: (a) => {
            setSelectedLayerId(a.layerId);
          },
          layerMomentary: (a) => {
            setSelectedLayerId(a.layerId);
          },
          macro: (a) => {
            setMacroId(a.macroId);
          },
          delay: (a) => {
            setDelayActionMs(a.delayMs);
          },
        },
        initialAction,
        "type"
      );
    }
  }, [initialAction]);

  // --- キー入力のキャプチャ (KeyEditorForm と同等のロジック) ---
  const addTargetKey = useCallback((vk: number) => {
    setTargetKeys((prev) => (prev.includes(vk) ? prev : [...prev, vk]));
  }, []);

  const { handleHoldKeyDown, handleHoldKeyUp } = useKeyHoldAction({
    targetKey: VK.ENTER,
    holdMs: 800,
  });
// TODO - 後でやる
  useEventHandler(
    [
      {
        type: "keydown",
        handler: (e) => {
          if (actionType === "remap") {
            addTargetKey(e.keyCode);
          }
          handleHoldKeyDown(e.keyCode, { onHold: () => {} }); // マクロ内では一応ガード
        },
      },
      {
        type: "keyup",
        handler: (e) => {
          handleHoldKeyUp(e.keyCode, { onHold: () => {} });
        },
      },
    ],
    [actionType, addTargetKey, handleHoldKeyDown, handleHoldKeyUp],
    { enabled: !isInputFocused }
  );

  // --- マウス位置取得 ---
  const { getCursorPosition } = useMousePosition();
  const handleGetMousePosition = (): void => {
    setIsCapturing(true);
    setCountdown(MOUSE_CAPTURE_COUNTDOWN_START);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          getCursorPosition().then((pos) => {
            setMouseX(pos.x);
            setMouseY(pos.y);
            setIsCapturing(false);
          });
          return 0;
        }
        return prev - 1;
      });
    }, COUNTDOWN_INTERVAL_MS);
  };

  const handleSaveInternal = () => {
    let action: Action;
    switch (actionType) {
      case "remap":
        action = {
          type: "remap",
          keys: targetKeys,
          repeat,
          repeatDelayMs,
          repeatIntervalMs,
        };
        break;
      case "layerToggle":
        action = { type: "layerToggle", layerId: selectedLayerId };
        break;
      case "layerMomentary":
        action = { type: "layerMomentary", layerId: selectedLayerId };
        break;
      case "mouseMove":
        action = { type: "mouseMove", x: mouseX, y: mouseY };
        break;
      case "mouseClick":
        action = {
          type: "mouseClick",
          x: mouseX,
          y: mouseY,
          button: mouseButton,
          clickCount,
        };
        break;
      case "cursorReturn":
        action = { type: "cursorReturn", delayMs: cursorReturnDelayMs };
        break;
      case "delay":
        action = { type: "delay", delayMs: delayActionMs };
        break;
      case "macro":
        action = { type: "macro", macroId };
        break;
      default:
        action = { type: "none" };
    }
    onSave(action);
  };

  // --- Handlers for ActionSettingsSection ---
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
    onRepeatChange: (r, d, i) => {
      setRepeat(r);
      if (d) {
        setRepeatDelayMs(d);
      }
      if (i) {
        setRepeatIntervalMs(i);
      }
    },
  };
  const keyEditorUIHandlers: KeyEditorUIHandlers = { setIsInputFocused };
  // TODO - src\renderer\src\components\organisms\editor\KeyEditorForm.tsxと共通化
  const keyEditorActions: UseKeyEditorActionsReturn = {
    handleSave: handleSaveInternal,
    handleRemove: () => {},
    canSave: actionType !== "none",
    keys: targetKeys,
    setKeys: setTargetKeys,
    reset: () => setTargetKeys([]),
    holds: [],
    removeKey: (vk: number) =>
      setTargetKeys((prev) => prev.filter((k) => k !== vk)),
    addHoldKey: addTargetKey,
    removeHoldKey: (vk: number) => {},
  };

  return (
    <VStack className="h-full min-h-[400px] p-6" gap={6}>
      <h2 className="border-b pb-2 font-bold text-xl">アクションの編集</h2>

      <div className="flex-1 overflow-auto">
        <ActionSettingsSection
          actionType={actionType}
          currentMacroId={currentMacroId}
          delayActionMs={delayActionMs}
          keyEditorActions={keyEditorActions}
          keyEditorUIHandlers={keyEditorUIHandlers}
          layers={layers}
          layout={layout}
          macroId={macroId}
          mouseHandlers={mouseHandlers}
          mouseState={mouseState}
          onOpenMacros={() => {}}
          repeatSettings={repeatSettings}
          selectedLayerId={selectedLayerId}
          selectedTrigger="tap"
          setActionType={setActionType}
          setDelayActionMs={setDelayActionMs}
          setMacroId={setMacroId}
          setSelectedLayerId={setSelectedLayerId}
          targetVk={0}
        />
      </div>

      <HStack className="justify-end border-t pt-4" gap={2}>
        <Button onClick={onCancel} variant="ghost">
          キャンセル
        </Button>
        <Button
          disabled={actionType === "none"}
          onClick={handleSaveInternal}
          variant="default"
        >
          決定
        </Button>
      </HStack>
    </VStack>
  );
}
