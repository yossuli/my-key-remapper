import type { TriggerType } from "../../shared/types/remapConfig";
import { executeAction, releaseMomentaryLayer } from "./actionExecutor";

/**
 * フックコールバック内のヘルパー関数
 */

/**
 * キーアップ時にモーメンタリーレイヤーを解除
 */
export function updateMomentaryLayerState(vkCode: number, isUp: boolean) {
  if (isUp) {
    releaseMomentaryLayer(vkCode);
  }
}

/**
 * アクションがある場合のみ実行
 */
export function executeActionIfNeeded(
  result: { hasAction?: boolean; trigger?: TriggerType },
  vkCode: number,
  isUp: boolean
) {
  if (result.hasAction && result.trigger) {
    executeAction(vkCode, result.trigger, isUp);
  }
}
