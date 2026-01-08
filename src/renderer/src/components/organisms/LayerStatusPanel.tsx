// レイヤースタック状態表示と強制リセットパネル

import { RefreshCw } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../atoms/Button";

interface LayerStatusPanelProps {
  /** 現在のレイヤースタック */
  stack: string[];
  /** 設定済みの全レイヤー */
  availableLayers: string[];
  /** 手動リフレッシュ */
  onRefresh: () => void;
  /** 指定レイヤーに強制リセット */
  onResetToLayer: (layerId: string) => void;
}

/**
 * レイヤースタック状態表示パネル
 * - 現在のスタック状態を可視化
 * - 手動リフレッシュボタン
 * - 各レイヤーへの強制リセットボタン
 */
export function LayerStatusPanel({
  stack,
  availableLayers,
  onRefresh,
  onResetToLayer,
}: LayerStatusPanelProps) {
  const handleResetClick = useCallback(
    (layerId: string) => () => {
      onResetToLayer(layerId);
    },
    [onResetToLayer]
  );

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">レイヤーステータス</h3>
        <Button onClick={onRefresh} size="sm" variant="ghost">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* 現在のスタック表示 */}
      <div className="space-y-2">
        <div className="text-muted-foreground text-sm">現在のスタック</div>
        <div className="flex flex-wrap gap-2">
          {stack.map((layerId, index) => (
            <div
              className={`rounded-md px-3 py-1 text-sm ${
                index === stack.length - 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              key={layerId}
            >
              {layerId}
              {index === stack.length - 1 && (
                <span className="ml-1 text-xs opacity-80">(アクティブ)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 強制リセットボタン */}
      <div className="space-y-2">
        <div className="text-muted-foreground text-sm">強制リセット</div>
        <div className="flex flex-wrap gap-2">
          {availableLayers.map((layerId) => (
            <Button
              key={layerId}
              onClick={handleResetClick(layerId)}
              size="sm"
              variant={
                stack.length === 1 && stack[0] === layerId
                  ? "ghost"
                  : "secondary"
              }
            >
              {layerId}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
