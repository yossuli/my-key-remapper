/**
 * BindingConfig関連の仲介型定義
 */

import type { UseBindingConfigReturn } from "@/hooks/useBindingConfig";

/** バインディング設定の状態 */
export type BindingConfigState = Pick<
  UseBindingConfigReturn,
  "state" | "existingTiming"
>;

/** バインディング設定のアクション */
export type BindingConfigActions = Pick<
  UseBindingConfigReturn,
  | "setActionType"
  | "setTargetKeys"
  | "addTargetKey"
  | "clearTargetKeys"
  | "setSelectedLayerId"
  | "loadBindingForTrigger"
>;

/** バインディング設定の全体制御 */
export type BindingConfigControl = Pick<
  UseBindingConfigReturn,
  | "state"
  | "existingTiming"
  | "setActionType"
  | "setTargetKeys"
  | "addTargetKey"
  | "clearTargetKeys"
  | "setSelectedLayerId"
  | "loadBindingForTrigger"
>;
