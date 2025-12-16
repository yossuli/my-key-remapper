import type { TriggerType } from "../../../../shared/types/remapConfig";
import { Button } from "../atoms/Button";
import { Mapped } from "../control/Mapped";

interface TriggerOption {
  value: TriggerType;
  label: string;
  id: string;
}

const TRIGGER_OPTIONS: TriggerOption[] = [
  { id: "tap", value: "tap", label: "Tap（単押し）" },
  { id: "hold", value: "hold", label: "Hold（長押し）" },
  { id: "doubleTap", value: "doubleTap", label: "Double Tap（2回押し）" },
];

interface TriggerSelectorProps {
  selectedTrigger: TriggerType;
  onTriggerChange: (trigger: TriggerType) => void;
}

export function TriggerSelector({
  selectedTrigger,
  onTriggerChange,
}: TriggerSelectorProps) {
  return (
    <div className="space-y-2">
      <label
        className="font-medium text-muted-foreground text-xs"
        htmlFor={selectedTrigger}
      >
        トリガー
      </label>
      <Mapped
        className="flex gap-1 rounded-lg border bg-muted/30 p-1"
        Tag="div"
        value={TRIGGER_OPTIONS}
      >
        {({ value, label, id }) => (
          <Button
            className="flex-1"
            id={id}
            onClick={() => onTriggerChange(value)}
            size="sm"
            variant={selectedTrigger === id ? "primary" : "ghost"}
          >
            {label}
          </Button>
        )}
      </Mapped>
    </div>
  );
}
