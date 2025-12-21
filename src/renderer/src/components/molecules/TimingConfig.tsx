// キー別タイミング設定コンポーネント

import { useCallback } from "react";

interface TimingConfigProps {
  /** 長押し判定のしきい値（ミリ秒） */
  holdThresholdMs?: number;
  /** ダブルタップ判定の間隔（ミリ秒） */
  tapIntervalMs?: number;
  /** 長押しタイミング変更時のコールバック */
  onHoldThresholdChange: (value: number | undefined) => void;
  /** タップ間隔変更時のコールバック */
  onTapIntervalChange: (value: number | undefined) => void;
  /** デフォルト値表示用 */
  defaultHoldThresholdMs?: number;
  /** デフォルト値表示用 */
  defaultTapIntervalMs?: number;
}

/**
 * キー別タイミング設定UIコンポーネント
 * 数値入力フィールドで holdThresholdMs と tapIntervalMs を設定
 */
export function TimingConfig({
  holdThresholdMs,
  tapIntervalMs,
  onHoldThresholdChange,
  onTapIntervalChange,
  defaultHoldThresholdMs = 200,
  defaultTapIntervalMs = 300,
}: TimingConfigProps) {
  const handleHoldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
        onHoldThresholdChange(undefined);
      } else {
        const num = Number.parseInt(value, 10);
        if (!Number.isNaN(num) && num > 0) {
          onHoldThresholdChange(num);
        }
      }
    },
    [onHoldThresholdChange]
  );

  const handleTapChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
        onTapIntervalChange(undefined);
      } else {
        const num = Number.parseInt(value, 10);
        if (!Number.isNaN(num) && num > 0) {
          onTapIntervalChange(num);
        }
      }
    },
    [onTapIntervalChange]
  );

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card/50 p-3">
      <div className="font-medium text-muted-foreground text-sm">
        タイミング設定
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            className="text-muted-foreground text-xs"
            htmlFor="holdThreshold"
          >
            ホールド判定 (ms)
          </label>
          <input
            className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
            id="holdThreshold"
            min="1"
            onChange={handleHoldChange}
            placeholder={`デフォルト: ${defaultHoldThresholdMs}`}
            type="number"
            value={holdThresholdMs ?? ""}
          />
        </div>
        <div className="space-y-1">
          <label
            className="text-muted-foreground text-xs"
            htmlFor="tapInterval"
          >
            タップ間隔 (ms)
          </label>
          <input
            className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
            id="tapInterval"
            min="1"
            onChange={handleTapChange}
            placeholder={`デフォルト: ${defaultTapIntervalMs}`}
            type="number"
            value={tapIntervalMs ?? ""}
          />
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        空欄の場合はデフォルト値が使用されます
      </p>
    </div>
  );
}
