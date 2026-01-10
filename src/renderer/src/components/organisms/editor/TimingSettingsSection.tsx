import { TabsContent } from "@/components/ui/tabs";
import type { TriggerType } from "../../../../../shared/types/remapConfig";
import { TimingInput } from "../../molecules/forms/TimingInput";

interface TimingSettingsSectionProps {
  selectedTrigger: TriggerType;
  holdThresholdMs: number | undefined;
  tapIntervalMs: number | undefined;
  defaultHoldThresholdMs: number | undefined;
  defaultTapIntervalMs: number | undefined;
  setHoldThresholdMs: (ms: number | undefined) => void;
  setTapIntervalMs: (ms: number | undefined) => void;
  setIsInputFocused: (focused: boolean) => void;
}

// SelectTriggerは構造上必要だが関数内では未使用
export function TimingSettingsSection({
  selectedTrigger: _selectedTrigger,
  holdThresholdMs,
  tapIntervalMs,
  defaultHoldThresholdMs,
  defaultTapIntervalMs,
  setHoldThresholdMs,
  setTapIntervalMs,
  setIsInputFocused,
}: TimingSettingsSectionProps) {
  return (
    <>
      <TabsContent value="hold">
        <TimingInput
          defaultValue={defaultHoldThresholdMs}
          id="holdThreshold"
          label="判定時間 (ms)"
          onValueChange={setHoldThresholdMs}
          setFocused={setIsInputFocused}
          value={holdThresholdMs}
        />
      </TabsContent>

      <TabsContent value="doubleTap">
        <TimingInput
          defaultValue={defaultTapIntervalMs}
          id="tapInterval"
          label="タップ間隔 (ms)"
          onValueChange={setTapIntervalMs}
          setFocused={setIsInputFocused}
          value={tapIntervalMs}
        />
      </TabsContent>
    </>
  );
}
