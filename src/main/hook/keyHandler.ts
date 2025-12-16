import type { TriggerType } from "../../shared/types/remapConfig";
import type { EventSender } from "../ipc/types";
import { KeyStateManager } from "../state/keyState";
import { remapRules } from "../state/rules";
import { isModifierKey } from "../utils/isModifierKey";

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
  eventSender: EventSender | null
): { shouldBlock: boolean; trigger?: TriggerType; hasAction?: boolean } {
  // UIにイベントを通知
  if (eventSender) {
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
  // 修飾キーの場合はhold判定を無効化
  if (isModifierKey(vkCode)) {
    // 修飾キーは通常のキー入力として扱う（hold判定しない）
    return { shouldBlock: false };
  }

  // キー状態を更新（ホールド判定のみ）
  keyStateManager.onKeyDown(vkCode, () => {
    // ホールドタイマーが発火した時はログ出力のみ
    console.log(`[HOOK] Hold detected for key ${vkCode}`);
  });

  // キーダウン時点ではまだアクションを実行しない（ホールド判定待ち）
  // holdバインディングのみの場合はデフォルトのキー入力を通す
  // tap/doubleTap/tapHoldバインディングがある場合のみブロックする
  const bindings = remapRules.getBindings(vkCode);
  const hasNonHoldBinding = bindings.some(
    (b) =>
      b.trigger === "tap" ||
      b.trigger === "doubleTap" ||
      b.trigger === "tapHold"
  );

  if (hasNonHoldBinding) {
    console.log(`[HOOK] Key Down blocked (has non-hold bindings): ${vkCode}`);
    return { shouldBlock: true };
  }

  // holdのみの場合はデフォルトのキー入力を通す
  return { shouldBlock: false };
}

/**
 * キーアップイベントを処理
 */
function handleKeyUp(vkCode: number): {
  shouldBlock: boolean;
  trigger?: TriggerType;
  hasAction?: boolean;
} {
  // トリガーを判定
  const trigger = keyStateManager.onKeyUp(vkCode);
  console.log(`[HOOK] Key Up: ${vkCode}, trigger: ${trigger}`);

  // ホールドが発火済みの場合は、ここでは何もしない（既に処理済み）
  if (trigger === "hold") {
    return { shouldBlock: true, trigger };
  }

  // アクションを取得
  const keyAction = remapRules.getAction(vkCode, trigger);
  if (keyAction) {
    return { shouldBlock: true, trigger, hasAction: true };
  }

  // バインディングがないのでキーを通す
  return { shouldBlock: false, trigger };
}

/**
 * キー状態マネージャーをリセット
 */
export function resetKeyState() {
  keyStateManager.reset();
}
