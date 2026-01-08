import { useState } from "react";
import type { GlobalSettings } from "../../../../shared/types/remapConfig";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";

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
    <div className="flex flex-col gap-4 px-6 py-4">
      <h3 className="font-bold text-lg">グローバルタイミング設定</h3>
      <p className="text-muted-foreground text-sm">
        すべてのキーのデフォルトの判定時間を設定します。個別のキーで設定されている場合はそちらが優先されます。
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Input
            id="global-hold-threshold"
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
            label="長押し判定時間 (ms)"
          />
          <span className="text-muted-foreground text-xs">
            キーを長押しと判定するまでの時間
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <Input
            id="global-tap-interval"
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
            label="ダブルタップ判定間隔 (ms)"
          />
          <span className="text-muted-foreground text-xs">
            2回のタップをダブルタップと判定する間隔
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          disabled={!hasChanges}
          onClick={handleSave}
          size="default"
          variant="default"
        >
          保存
        </Button>
      </div>
    </div>
  );
}
