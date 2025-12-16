import type { ActionType } from "../../../../shared/types/remapConfig";
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
  onActionTypeChange: (actionType: ActionType) => void;
}

export function ActionTypeSelector({
  actionType,
  onActionTypeChange,
}: ActionTypeSelectorProps) {
  return (
    <Select
      id="actionType"
      label="アクション"
      options={ACTION_TYPE_OPTIONS}
      select-onChange={(e) => onActionTypeChange(e.target.value as ActionType)}
      select-value={actionType}
    />
  );
}
