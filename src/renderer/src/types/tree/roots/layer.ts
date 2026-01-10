/**
 * Layer関連の仲介型定義
 */

import type { UseLayerStateReturn } from "@/hooks/useLayerState";

/** レイヤー状態の基本情報 */
export type LayerState = Pick<UseLayerStateReturn, "layers" | "layerId">;

/** レイヤー操作のアクション */
export type LayerActions = Pick<
  UseLayerStateReturn,
  "setLayerId" | "addLayer" | "removeLayer" | "reorderLayers"
>;

/** マッピング操作 */
export type MappingActions = Pick<
  UseLayerStateReturn,
  "saveMapping" | "removeMapping"
>;

/** レイヤー制御の全体（状態 + アクション） */
export type LayerControl = LayerState & LayerActions;

/** バインディング状態 */
export type BindingsState = Pick<UseLayerStateReturn, "currentBindings">;

/** レイヤー順序のみ */
export type LayerOrderState = Pick<UseLayerStateReturn, "layerOrder">;
