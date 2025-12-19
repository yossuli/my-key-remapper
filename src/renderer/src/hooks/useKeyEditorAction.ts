// 保存・削除アクションのフック

import { useCallback } from "react";
import type {
  Action,
  ActionType,
  TriggerType,
} from "../../../shared/types/remapConfig";
import type { BindingState } from "../utils/bindingState";
import { objectiveSwitch } from "../utils/objectiveSwitch";

interface UseKeyEditorActionsProps {
  state: BindingState;
  selectedTrigger: TriggerType;
  onSave: (trigger: TriggerType, action: Action) => void;
  onRemove: (trigger: TriggerType) => void;
  onClose: () => void;
}

interface UseKeyEditorActionsReturn {
  handleSave: () => void;
  handleRemove: () => void;
}

/**
 * キーエディターの保存・削除アクションフック
 */
export function useKeyEditorActions({
  state: { actionType, targetKeys, selectedLayerId },
  selectedTrigger,
  onSave,
  onRemove,
  onClose,
}: UseKeyEditorActionsProps): UseKeyEditorActionsReturn {
  const handleSave = useCallback(() => {
    const action: Action = objectiveSwitch<ActionType, Action>(
      {
        remap: () => ({ type: "remap", keys: targetKeys }),
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
    targetKeys,
  ]);

  const handleRemove = useCallback(() => {
    onRemove(selectedTrigger);
    onClose();
  }, [onClose, onRemove, selectedTrigger]);

  return { handleSave, handleRemove };
}
