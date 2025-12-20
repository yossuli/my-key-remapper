import { sendKey } from "../native/sender";
import { KeyStateManager } from "../state/keyState";
import { remapRules } from "../state/rules";
import {
  addMomentaryLayer,
  executeAction,
  handleTapOnlyBindings,
  releaseMomentaryLayer,
} from "./actionExecutor";

/**
 * キーイベント処理
 */

const keyStateManager = new KeyStateManager();

/** リマップ有効フラグ（モーダル表示中は無効化） */
let remapEnabled = true;

/**
 * リマップ有効/無効を設定
 */
export function setRemapEnabled(enabled: boolean) {
  remapEnabled = enabled;
}

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
 * 1回のループでhold/tapのアクションを探索
 */

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: 早さ優先
function processPendingHoldKeys() {
  const holdKeys = keyStateManager.getPendingHoldKeys();
  for (const key of holdKeys) {
    const bindings = remapRules.getBindings(key);

    let holdRemapKeys: number[] | null = null;
    let tapRemapKeys: number[] | null = null;

    for (const binding of bindings) {
      const { trigger, action } = binding;

      // holdトリガーのlayerMomentaryは最優先で即時return
      if (trigger === "hold" && action.type === "layerMomentary") {
        addMomentaryLayer(key, action.layerId);
        return;
      }

      // holdとtapのremapキーを記録
      if (action.type === "remap") {
        if (trigger === "hold" && holdRemapKeys === null) {
          holdRemapKeys = action.keys;
        } else if (trigger === "tap" && tapRemapKeys === null) {
          tapRemapKeys = action.keys;
        }
      }
    }

    // hold優先、なければtap
    const remapKeys = holdRemapKeys ?? tapRemapKeys;
    if (remapKeys !== null) {
      // 複数キーを順番に送信
      for (const remapKey of remapKeys) {
        sendKey(remapKey, false);
      }
      return;
    }
  }
}

/**
 * キーアップイベントを処理
 */
export function handleKeyUp(vkCode: number): number {
  // リマップ無効時はパススルー
  if (!remapEnabled) {
    return 0;
  }

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
  // リマップ無効時はパススルー
  if (!remapEnabled) {
    return 0;
  }

  processPendingHoldKeys();

  const bindings = remapRules.getBindings(vkCode);

  // tap のみのバインディングを先に処理
  const tapResult = handleTapOnlyBindings(vkCode, bindings, false);
  if (tapResult !== null) {
    return tapResult;
  }

  keyStateManager.onKeyDown(vkCode);
  return 1;
}
