import { KeyStateManager } from "../state/keyState";
import { remapRules } from "../state/rules";

/**
 * キーハンドラー用のキー状態マネージャー
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
