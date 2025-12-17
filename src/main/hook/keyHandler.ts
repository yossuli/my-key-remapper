import { sendKey } from "../native/sender";
import { KeyStateManager } from "../state/keyState";
import { remapRules } from "../state/rules";
import {
  executeAction,
  getRemapKey,
  releaseMomentaryLayer,
} from "./actionExecutor";

/**
 * キーイベント処理
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
 * キー状態マネージャーをリセット
 */
export function resetKeyState() {
  keyStateManager.reset();
}

/**
 * トリガーコールバックを設定（遅延発火用）
 */
export function setupTriggerCallback() {
  keyStateManager.setTriggerCallback((code, trigger) => {
    executeAction(code, trigger);
  });
}

/**
 * 保留中のホールドキーを処理（割り込み入力時）
 */
function processPendingHoldKeys() {
  const holdKeys = keyStateManager.getPendingHoldKeys();
  for (const key of holdKeys) {
    const bindings = remapRules.getBindings(key);

    const holdActionKey = getRemapKey(bindings, "hold");
    if (holdActionKey) {
      sendKey(holdActionKey, false);
      return;
    }

    const tapActionKey = getRemapKey(bindings, "tap");
    if (tapActionKey) {
      sendKey(tapActionKey, false);
    }
  }
}

/**
 * キーアップイベントを処理
 */
export function handleKeyUp(vkCode: number): number {
  releaseMomentaryLayer(vkCode);

  const hasDoubleTapBinding = !!remapRules.getAction(vkCode, "doubleTap");
  const trigger = keyStateManager.onKeyUp(vkCode, hasDoubleTapBinding);

  // トリガーが null の場合は遅延発火待ち（コールバックで後から発火）
  if (trigger !== null) {
    executeAction(vkCode, trigger);
  }

  return 1;
}

/**
 * キーダウンイベントを処理
 */
export function handleKeyDown(vkCode: number): number {
  processPendingHoldKeys();

  const bindings = remapRules.getBindings(vkCode);
  if (bindings.length === 0) {
    sendKey(vkCode, false);
    return 1;
  }

  keyStateManager.onKeyDown(vkCode);
  return 1;
}
