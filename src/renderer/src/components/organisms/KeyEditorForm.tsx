import { useCallback, useEffect, useRef, useState } from "react";
import { VK } from "../../../../shared/constants";
import type {
  Action,
  ActionType,
  Layer,
  TriggerType,
} from "../../../../shared/types/remapConfig";
import type { KeyboardLayout } from "../../types";
import { getLayerDescription } from "../../utils/getLayerDescription";
import {
  objectiveDiscriminantSwitch,
  objectiveSwitch,
} from "../../utils/objectiveSwitch";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { ActionTypeSelector } from "../molecules/ActionTypeSelector";
import { KeyDisplay } from "../molecules/KeyDisplay";
import { LayerSelector } from "../molecules/LayerSelector";
import { TriggerSelector } from "../molecules/TriggerSelector";

interface KeyEditorFormProps {
  targetVk: number;
  keyboardLayout: KeyboardLayout;
  currentBinding?: { trigger: TriggerType; action: Action };
  layers: Pick<Layer, "id">[];
  onSave: (trigger: TriggerType, action: Action) => void;
  onRemove: (trigger: TriggerType) => void;
  onClose: () => void;
}

export function KeyEditorForm({
  targetVk,
  keyboardLayout,
  currentBinding,
  layers,
  onSave,
  onRemove,
  onClose,
}: KeyEditorFormProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>("tap");
  const [actionType, setActionType] = useState<ActionType>("remap");
  const [targetKey, setTargetKey] = useState("");
  const [selectedLayerId, setSelectedLayerId] = useState(layers[0]?.id || "");

  const inputFocusedRef = useRef(false);
  const enterTimerRef = useRef<number | null>(null);
  const enterActiveRef = useRef(false);
  const ENTER_HOLD_MS = 2000;

  const clearEnterTimer = useCallback(() => {
    if (enterTimerRef.current !== null) {
      window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    enterActiveRef.current = false;
  }, []);

  const handleSave = useCallback(() => {
    const action: Action = objectiveSwitch<ActionType, Action>(
      {
        remap: () => ({ type: "remap", key: Number.parseInt(targetKey, 10) }),
        layerToggle: () => ({ type: "layerToggle", layerId: selectedLayerId }),
        layerMomentary: () => ({
          type: "layerMomentary",
          layerId: selectedLayerId,
        }),
        none: () => ({ type: "none" }),
      },
      actionType
    );

    onSave(selectedTrigger, action);
    onClose();
  }, [
    actionType,
    onClose,
    onSave,
    selectedLayerId,
    selectedTrigger,
    targetKey,
  ]);

  const handleRemove = useCallback(() => {
    onRemove(selectedTrigger);
    onClose();
  }, [onClose, onRemove, selectedTrigger]);

  // バインディングが変わったらフォームを更新
  useEffect(() => {
    if (currentBinding) {
      objectiveDiscriminantSwitch(
        {
          remap: (act) => {
            setActionType("remap");
            setTargetKey(act.key.toString());
          },
          layerToggle: (act) => {
            setActionType("layerToggle");
            setSelectedLayerId(act.layerId);
          },
          layerMomentary: (act) => {
            setActionType("layerMomentary");
            setSelectedLayerId(act.layerId);
          },
          none: () => {
            setActionType("none");
          },
        },
        currentBinding.action,
        "type"
      );
    } else {
      setTargetKey("");
    }
  }, [currentBinding]);

  // キーイベントリスナー
  useEffect(() => {
    const handleEnterKeyEvent = (isKeyUp: boolean) => {
      if (isKeyUp) {
        clearEnterTimer();
        if (enterActiveRef.current) {
          enterActiveRef.current = false;
          return true;
        }
        handleSave();
        onClose();
      } else if (!enterActiveRef.current) {
        enterActiveRef.current = true;
        enterTimerRef.current = window.setTimeout(() => {
          enterActiveRef.current = false;
        }, ENTER_HOLD_MS);
      }
      return false;
    };

    const handleKeyEvent = (
      _event: unknown,
      data: { vkCode: number; isUp: boolean }
    ) => {
      if (data.vkCode === VK.ENTER && !handleEnterKeyEvent(data.isUp)) {
        return;
      }

      if (inputFocusedRef.current || actionType !== "remap") {
        return;
      }
      setTargetKey(data.vkCode.toString());
    };

    const ipc = window.electron?.ipcRenderer;
    ipc?.on("key-event", handleKeyEvent);
    return () => {
      ipc?.off("key-event", handleKeyEvent);
    };
  }, [clearEnterTimer, onClose, handleSave, actionType]);

  return (
    <div className="space-y-4 p-6">
      {/* キー表示 */}
      <div className="flex items-center justify-center gap-4 font-bold text-2xl">
        <KeyDisplay keyboardLayout={keyboardLayout} vkCode={targetVk} />
      </div>

      {/* トリガー選択 */}
      <TriggerSelector
        onTriggerChange={setSelectedTrigger}
        selectedTrigger={selectedTrigger}
      />

      {/* アクション種別選択 */}
      <ActionTypeSelector
        actionType={actionType}
        onActionTypeChange={setActionType}
      />

      {/* リマップ設定 */}
      {actionType === "remap" && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-4 font-bold text-xl">
            <span className="text-muted-foreground">→</span>
            <KeyDisplay
              keyboardLayout={keyboardLayout}
              variant="primary"
              vkCode={targetKey ? Number.parseInt(targetKey, 10) : 0}
            />
          </div>
          <Input
            id="targetKey"
            input-onBlur={() => {
              inputFocusedRef.current = false;
            }}
            input-onChange={(e) => setTargetKey(e.target.value)}
            input-onFocus={() => {
              inputFocusedRef.current = true;
            }}
            input-placeholder="VK Code (e.g., 65) またはキーを押す"
            input-type="number"
            input-value={targetKey}
            label="ターゲットキー"
          />
        </div>
      )}

      {/* レイヤー選択 */}
      {(actionType === "layerToggle" || actionType === "layerMomentary") && (
        <LayerSelector
          description={getLayerDescription(actionType)}
          layers={layers}
          onLayerChange={setSelectedLayerId}
          selectedLayerId={selectedLayerId}
        />
      )}

      {/* ボタン */}
      <div className="flex justify-end gap-2 pt-2">
        {currentBinding !== undefined && (
          <Button onClick={handleRemove} variant="destructive">
            削除
          </Button>
        )}
        <Button
          disabled={actionType === "remap" && !targetKey}
          onClick={handleSave}
          variant="primary"
        >
          保存
        </Button>
      </div>
    </div>
  );
}
