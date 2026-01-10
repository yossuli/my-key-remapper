// 保存・削除アクションのフック

import { useCallback, useMemo, useState } from "react";
import type { BindingState } from "@/utils/bindingState";
import { objectiveSwitch } from "@/utils/objectiveSwitch";
import type {
  Action,
  ActionType,
  TriggerType,
} from "../../../shared/types/remapConfig";

export interface UseKeyEditorActionsProps {
  state: BindingState;
  layerId: string;
  targetVk: number | null;
  selectedTrigger: TriggerType;
  onSave: (trigger: TriggerType, action: Action) => void;
  onRemove?: (trigger: TriggerType) => void;
  onClose?: () => void;
}

export interface UseKeyEditorActionsReturn {
  canSave: boolean;
  holds: number[];
  newTargetKeys: number[];
  addHoldKey: (vkCode: number) => void;
  removeHoldKey: (vkCode: number) => void;
  removeKey: (keyCode: number) => void;
  resetState: () => void;
  handleSave: () => void;
  handleRemove: () => void;
}

/**
 * キーエディターの保存・削除アクションフック
 */
export function useKeyEditorActions({
  state: { actionType, targetKeys, selectedLayerId },
  layerId,
  targetVk,
  selectedTrigger,
  onSave,
  onRemove,
  onClose,
}: UseKeyEditorActionsProps): UseKeyEditorActionsReturn {
  const [newTargetKeys, setNewTargetKeys] =
    useState<UseKeyEditorActionsReturn["newTargetKeys"]>(targetKeys);
  const [holds, setHolds] = useState<number[]>([]);

  const computedTargetKeys = useMemo(() => {
    if (newTargetKeys.length === 0) {
      return targetKeys;
    }
    return newTargetKeys;
  }, [newTargetKeys, targetKeys]);

  const canSave = useMemo(
    () =>
      targetVk !== null &&
      !(
        actionType === "remap" &&
        (computedTargetKeys.length === 0 ||
          (computedTargetKeys.length === 1 &&
            layerId === "base" &&
            computedTargetKeys[0] === targetVk))
      ),
    [actionType, computedTargetKeys, targetVk, layerId]
  );

  const remove = useCallback(
    <T>(array: T[], item: T): T[] => array.filter((i) => i !== item),
    []
  );

  const addHoldKey = useCallback<UseKeyEditorActionsReturn["addHoldKey"]>(
    (vkCode) => {
      setHolds((prev) => [...remove(prev, vkCode), vkCode]);
      if (holds.length === 0) {
        setNewTargetKeys([vkCode]);
      } else {
        setNewTargetKeys((prev) => [...remove(prev, vkCode), vkCode]);
      }
    },
    [holds.length, remove]
  );

  const removeHoldKey = useCallback<UseKeyEditorActionsReturn["removeHoldKey"]>(
    (vkCode) => {
      setHolds((prev) => remove(prev, vkCode));
    },
    [remove]
  );

  const removeKey = useCallback<UseKeyEditorActionsReturn["removeKey"]>(
    (keyCode) => {
      setNewTargetKeys((prev) => remove(prev, keyCode));
      setHolds((prev) => remove(prev, keyCode));
    },
    [remove]
  );

  // 状態をリセット
  const resetState = useCallback<
    UseKeyEditorActionsReturn["resetState"]
  >(() => {
    setNewTargetKeys([]);
    setHolds([]);
  }, []);

  const handleSave = useCallback<
    UseKeyEditorActionsReturn["handleSave"]
  >(() => {
    if (!canSave) {
      return;
    }
    const action: Action = objectiveSwitch<ActionType, Action>(
      {
        remap: () => ({ type: "remap", keys: newTargetKeys }),
        layerToggle: () => ({
          type: "layerToggle",
          layerId: selectedLayerId,
        }),
        layerMomentary: () => ({
          type: "layerMomentary",
          layerId: selectedLayerId,
        }),
        mouseMove: () => ({
          type: "mouseMove",
          x: 0,
          y: 0,
        }),
        mouseClick: () => ({
          type: "mouseClick",
          x: 0,
          y: 0,
          button: "left",
          clickCount: 1,
        }),
        cursorReturn: () => ({
          type: "cursorReturn",
          delayMs: 1000,
        }),
        none: () => ({ type: "none" }),
      },
      actionType
    );

    onSave(selectedTrigger, action);
    onClose?.();
  }, [
    actionType,
    newTargetKeys,
    selectedLayerId,
    selectedTrigger,
    onClose,
    onSave,
    canSave,
  ]);

  const handleRemove = useCallback<
    UseKeyEditorActionsReturn["handleRemove"]
  >(() => {
    onRemove?.(selectedTrigger);
    onClose?.();
  }, [onClose, onRemove, selectedTrigger]);

  return {
    canSave,
    holds,
    newTargetKeys: computedTargetKeys,
    addHoldKey,
    removeHoldKey,
    removeKey,
    resetState,
    handleSave,
    handleRemove,
  };
}
