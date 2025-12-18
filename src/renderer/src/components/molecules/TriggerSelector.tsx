import type { TriggerType } from "../../../../shared/types/remapConfig";
import { cn } from "../../utils/cn";
import { Button } from "../atoms/Button";
import { Mapped } from "../control/Mapped";
import { Show } from "../control/Show";

interface TriggerOption {
  value: TriggerType;
  label: string;
  shortLabel: string;
  id: string;
}

const TRIGGER_OPTIONS: TriggerOption[] = [
  { id: "tap", value: "tap", label: "Tap（単押し）", shortLabel: "Tap" },
  { id: "hold", value: "hold", label: "Hold（長押し）", shortLabel: "Hold" },
  {
    id: "doubleTap",
    value: "doubleTap",
    label: "Double Tap（2回押し）",
    shortLabel: "Double",
  },
];

interface TriggerSelectorProps {
  selectedTrigger: TriggerType;
  onTriggerChange: (trigger: TriggerType) => void;
  /** サイズ: compactはLayerTabsと横に並べる用、defaultは通常表示 */
  size?: "compact" | "default";
}

export function TriggerSelector({
  selectedTrigger,
  onTriggerChange,
  size = "default",
}: TriggerSelectorProps) {
  const isCompact = size === "compact";

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        isCompact ? undefined : "flex-col"
      )}
    >
      <Show condition={!isCompact}>
        <label
          className="self-start font-medium text-muted-foreground text-xs"
          htmlFor={selectedTrigger}
        >
          トリガー
        </label>
      </Show>
      <Show condition={isCompact}>
        <span className="text-muted-foreground text-sm">Trigger:</span>
      </Show>
      <Mapped
        as="div"
        className="flex gap-1 rounded-lg border bg-muted/30 p-1"
        value={TRIGGER_OPTIONS}
      >
        {({ value, label, shortLabel, id }) => (
          <Button
            className={cn(isCompact ? undefined : "flex-1")}
            id={id}
            onClick={() => onTriggerChange(value)}
            size="sm"
            variant={selectedTrigger === id ? "primary" : "ghost"}
          >
            {isCompact ? shortLabel : label}
          </Button>
        )}
      </Mapped>
    </div>
  );
}
