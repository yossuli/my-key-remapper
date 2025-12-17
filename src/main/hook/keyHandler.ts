import type { Action } from "../../shared/types/remapConfig";
import type { EventSender } from "../ipc/types";
import { KeyStateManager } from "../state/keyState";
import { remapRules } from "../state/rules";

/**
 * キーダウン/アップのロジックを処理
 */

const keyStateManager = new KeyStateManager();

/**
 * グローバル設定を適用
 */
export function applyGlobalSettings() {
  const settings = remapRules.getGlobalSettings();
  keyStateManager.setThresholds(
    settings.defaultHoldThresholdMs,
    settings.defaultTapIntervalMs
  );
}

/**
 * キーイベントのロジックを処理
 */
export function handleKeyLogic(
  vkCode: number,
  isUp: boolean,
  eventSender: EventSender | null,
  isSendToUI = true
): { shouldBlock: boolean; action?: Action } {
  // UIにイベントを通知
  if (eventSender && isSendToUI) {
    eventSender("key-event", { vkCode, isUp });
  }

  if (isUp) {
    return handleKeyUp(vkCode);
  }
  return handleKeyDown(vkCode);
}

/**
 * キーダウンイベントを処理
 */
function handleKeyDown(vkCode: number): { shouldBlock: boolean } {
  // キー状態を更新（ホールド判定のみ）
  keyStateManager.onKeyDown(vkCode);

  const bindings = remapRules.getBindings(vkCode);
  const hasBinding = bindings.some(
    (b) =>
      b.trigger === "tap" || b.trigger === "hold" || b.trigger === "doubleTap"
  );

  if (hasBinding) {
    console.log(`[HOOK] Key Down blocked (has non-hold bindings): ${vkCode}`);
    return { shouldBlock: true };
  }

  return { shouldBlock: false };
}

/**
 * キーアップイベントを処理
 */
function handleKeyUp(vkCode: number): {
  shouldBlock: boolean;
  action?: Action;
} {
  // トリガーを判定
  const trigger = keyStateManager.onKeyUp(vkCode);
  console.log(`[HOOK] Key Up: ${vkCode}, trigger: ${trigger}`);

  // アクションを取得
  const action = remapRules.getAction(vkCode, trigger);
  console.log(action);
  if (action) {
    if (trigger === "hold") {
      return { shouldBlock: false, action };
    }

    return { shouldBlock: true, action };
  }

  // バインディングがないのでキーを通すaaaabb
  return { shouldBlock: false };
}

/**
 * キー状態マネージャーをリセット
 */
export function resetKeyState() {
  keyStateManager.reset();
}
