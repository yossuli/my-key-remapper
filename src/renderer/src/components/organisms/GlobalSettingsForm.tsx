import { useState } from "react";
import type { GlobalSettings } from "../../../../shared/types/remapConfig";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Text } from "../atoms/Text";
import { VStack, HStack } from "../template/Flex";

interface GlobalSettingsFormProps {
  globalSettings: GlobalSettings;
  onSave: (settings: Partial<GlobalSettings>) => void;
}

/**
 * グローバル設定を編集するフォーム
 */
export function GlobalSettingsForm({
  globalSettings,
  onSave,
}: GlobalSettingsFormProps) {
  const [holdThresholdMs, setHoldThresholdMs] = useState(
    globalSettings.defaultHoldThresholdMs
  );
  const [tapIntervalMs, setTapIntervalMs] = useState(
    globalSettings.defaultTapIntervalMs
  );

  const handleSave = () => {
    onSave({
      defaultHoldThresholdMs: holdThresholdMs,
      defaultTapIntervalMs: tapIntervalMs,
    });
  };

  const hasChanges =
    holdThresholdMs !== globalSettings.defaultHoldThresholdMs ||
    tapIntervalMs !== globalSettings.defaultTapIntervalMs;

  return (
    <VStack gap={4} className="px-6">
      <VStack gap={1}>
        <Text size="lg" weight="bold">グローバルタイミング設定</Text>
        <Text size="sm" variant="muted">
          すべてのキーのデフォルトの判定時間を設定します。個別のキーで設定されている場合はそちらが優先されます。
        </Text>
      </VStack>

      <VStack gap={3}>
        <VStack gap={1}>
          <Input
            id="global-hold-threshold"
            label="長押し判定時間 (ms)"
            input-min="1"
            input-onChange={(e) => {
              const val = e.target.value;
              const num = Number.parseInt(val, 10);
              if (!Number.isNaN(num) && num > 0) {
                setHoldThresholdMs(num);
              }
            }}
            input-type="number"
            input-value={holdThresholdMs}
          />
          <Text size="xs" variant="muted">
            キーを長押しと判定するまでの時間
          </Text>
        </VStack>

        <VStack gap={1}>
          <Input
            id="global-tap-interval"
            label="ダブルタップ判定間隔 (ms)"
            input-min="1"
            input-onChange={(e) => {
              const val = e.target.value;
              const num = Number.parseInt(val, 10);
              if (!Number.isNaN(num) && num > 0) {
                setTapIntervalMs(num);
              }
            }}
            input-type="number"
            input-value={tapIntervalMs}
          />
          <Text size="xs" variant="muted">
            2回のタップをダブルタップと判定する間隔
          </Text>
        </VStack>
      </VStack>

      <HStack gap={2} className="justify-end">
        <Button
          disabled={!hasChanges}
          onClick={handleSave}
          size="default"
          variant="default"
        >
          保存
        </Button>
      </HStack>
    </VStack>
  );
}
