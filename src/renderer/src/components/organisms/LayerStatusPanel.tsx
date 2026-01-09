// レイヤースタック状態表示と強制リセットパネル

import { RefreshCw } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../atoms/Button";
import { Card } from "../atoms/Card";
import { Text } from "../atoms/Text";
import { VStack, HStack, Wrap } from "../template/Flex";

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
    <Card className="p-4">
      <VStack gap={4}>
        {/* ヘッダー */}
        <HStack className="justify-between">
          <Text size="lg" weight="semibold">
            レイヤーステータス
          </Text>
          <Button onClick={onRefresh} variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </HStack>

        {/* 現在のスタック表示 */}
        <VStack gap={2}>
          <Text size="sm" variant="muted">
            現在のスタック
          </Text>
          <Wrap gap={2}>
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
          </Wrap>
        </VStack>

        {/* 強制リセットボタン */}
        <VStack gap={2}>
          <Text size="sm" variant="muted">
            強制リセット
          </Text>
          <Wrap gap={2}>
            {availableLayers.map((layerId) => (
              <Button
                label={layerId}
                key={layerId}
                onClick={handleResetClick(layerId)}
                variant={
                  stack.length === 1 && stack[0] === layerId
                    ? "ghost"
                    : "secondary"
                }
              />
            ))}
          </Wrap>
        </VStack>
      </VStack>
    </Card>
  );
}
