import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TriggerType } from "../../../../shared/types/remapConfig";
import { cn } from "../../utils/cn";
import { Mapped } from "../control/Mapped";
import { Show } from "../control/Show";
import { Then } from "../control/Ternary";

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

export function TriggerTabs({
  selectedTrigger,
  onTriggerChange,
  size = "default",
}: TriggerSelectorProps) {
  const isCompact = size === "compact";

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        isCompact ? undefined : "flex-col items-start"
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

      <Tabs
        className="w-full"
        onValueChange={(val) => onTriggerChange(val as TriggerType)}
        value={selectedTrigger}
      >
        <TabsList
          className={cn(
            "h-auto bg-muted/30 p-1",
            !isCompact && "w-full justify-start"
          )}
        >
          <Mapped as={Then} value={TRIGGER_OPTIONS}>
            {({ value, label, shortLabel }) => (
              <TabsTrigger
                className={cn(
                  "data-[state=active]:bg-background",
                  !isCompact && "flex-1"
                )}
                key={value}
                value={value}
              >
                {isCompact ? shortLabel : label}
              </TabsTrigger>
            )}
          </Mapped>
        </TabsList>
      </Tabs>
    </div>
  );
}
