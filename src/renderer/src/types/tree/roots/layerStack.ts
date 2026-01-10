/**
 * LayerStack関連の仲介型定義
 * UseLayerStackReturnからPickして作成
 */

import type { UseLayerStackReturn } from "@/hooks/useLayerStack";

/** レイヤースタック制御 */
export type LayerStackControl = Pick<
  UseLayerStackReturn,
  "stack" | "refresh" | "resetToLayer"
>;

/** レイヤースタック状態のみ */
export type LayerStackState = Pick<UseLayerStackReturn, "stack">;
