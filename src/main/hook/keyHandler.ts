import { sendKey } from "../native/sender";
import { KeyStateManager } from "../state/keyState";
import { remapRules } from "../state/rules";
import {
  addMomentaryLayer,
  executeAction,
  handleTapOnlyBindings,
  isLayerMomentaryKey,
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
function processPendingHoldKeys(): void {
  const holdKeys = keyStateManager.getPendingHoldKeys();
  for (const key of holdKeys) {
    // 既にモーメンタリーレイヤーを発動中のキーはスキップ
    if (isLayerMomentaryKey(key)) {
      continue;
    }
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
        // biome-ignore lint/style/noMagicNumbers: 連続送信の遅延時間はここで定義
        sendKey(remapKey, false, 11);
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

  // 現在のレイヤーからバインディングを取得し、タイミング設定を抽出
  const bindings = remapRules.getBindings(vkCode);
  let holdThresholdMs: number | undefined;
  let tapIntervalMs: number | undefined;

  // 各bindingからtriggerに応じたtimingMsを取得
  for (const binding of bindings) {
    if (binding.trigger === "hold" && binding.timingMs !== undefined) {
      holdThresholdMs = binding.timingMs;
    } else if (
      binding.trigger === "doubleTap" &&
      binding.timingMs !== undefined
    ) {
      tapIntervalMs = binding.timingMs;
    }
  }

  const keyTiming = { holdThresholdMs, tapIntervalMs };
  const hasDoubleTapBinding = !!remapRules.getAction(vkCode, "doubleTap");
  const trigger = keyStateManager.onKeyUp(
    vkCode,
    hasDoubleTapBinding,
    keyTiming
  );

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

  // 現在のレイヤーからバインディングを取得し、タイミング設定を抽出
  const bindingsForTiming = remapRules.getBindings(vkCode);
  let holdThresholdMs: number | undefined;
  let tapIntervalMs: number | undefined;

  // 各bindingからtriggerに応じたtimingMsを取得
  for (const binding of bindingsForTiming) {
    if (binding.trigger === "hold" && binding.timingMs !== undefined) {
      holdThresholdMs = binding.timingMs;
    } else if (
      binding.trigger === "doubleTap" &&
      binding.timingMs !== undefined
    ) {
      tapIntervalMs = binding.timingMs;
    }
  }

  const keyTiming = { holdThresholdMs, tapIntervalMs };
  keyStateManager.onKeyDown(vkCode, keyTiming);
  return 1;
}
