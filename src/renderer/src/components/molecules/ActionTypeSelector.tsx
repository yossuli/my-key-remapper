import { useMemo } from "react";
import type {
  ActionType,
  TriggerType,
} from "../../../../shared/types/remapConfig";
import { Select } from "../atoms/Select";

const ACTION_TYPE_OPTIONS = [
  { id: "remap", value: "remap", label: "キーリマップ" },
  { id: "layerToggle", value: "layerToggle", label: "レイヤー切替" },
  {
    id: "layerMomentary",
    value: "layerMomentary",
    label: "レイヤー（押下中）",
  },
  { id: "none", value: "none", label: "無効化" },
] as const satisfies { id: ActionType; value: ActionType; label: string }[];

interface ActionTypeSelectorProps {
  actionType: ActionType;
  triggerType: TriggerType;
  onActionTypeChange: (actionType: ActionType) => void;
}

export function ActionTypeSelector({
  actionType,
  triggerType,
  onActionTypeChange,
}: ActionTypeSelectorProps) {
  // holdトリガーの時のみlayerMomentaryを表示（hold以外では非表示）
  const filteredOptions = useMemo(() => {
    if (triggerType !== "hold") {
      return ACTION_TYPE_OPTIONS.filter((opt) => opt.id !== "layerMomentary");
    }
    return ACTION_TYPE_OPTIONS;
  }, [triggerType]);

  return (
    <Select
      id="actionType"
      label="アクション"
      options={filteredOptions}
      select-onChange={(e) => onActionTypeChange(e.target.value as ActionType)}
      select-value={actionType}
    />
  );
}
