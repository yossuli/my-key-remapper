import { sendKey } from "../native/sender";
import { KeyStateManager } from "../state/keyState";
import { remapRules } from "../state/rules";
import { debugLog } from "../utils/debugLogger";
import {
  addMomentaryLayer,
  executeAction,
  handleTapOnlyBindings,
  isLayerMomentaryKey,
  releaseMomentaryLayer,
  stopRemapAction,
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
  debugLog("keyHandler.ts-24-setRemapEnabled", { enabled });
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
function processPendingHoldKeys(currentVkCode: number): void {
  const holdKeys = keyStateManager.getPendingHoldKeys();
  if (holdKeys.length > 0) {
    debugLog("keyHandler.ts-62-processPendingHoldKeys-keys", { holdKeys });
  }
  for (const key of holdKeys) {
    // 既にモーメンタリーレイヤーを発動中のキーはスキップ
    if (isLayerMomentaryKey(key)) {
      debugLog("keyHandler.ts-66-skip-layerMomentaryKey", { key });
      continue;
    }

    // 自分自身（同じキー）のリピート入力は割り込みとみなさない
    if (key === currentVkCode) {
      continue;
    }

    const bindings = remapRules.getBindings(key);
    let holdRemapKeys: number[] | null = null;
    let tapRemapKeys: number[] | null = null;

    for (const binding of bindings) {
      const { trigger, action } = binding;

      // holdトリガーのlayerMomentaryは最優先で即時return
      if (trigger === "hold" && action.type === "layerMomentary") {
        debugLog("keyHandler.ts-76-hold-layerMomentary", {
          key,
          layerId: action.layerId,
        });
        keyStateManager.forceResolveHold(key); // タイマー停止
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
      debugLog("keyHandler.ts-remap-interrupted-triggering", {
        key,
        remapKeys,
        reason: holdRemapKeys ? "hold-binding-found" : "tap-binding-found",
        currentVkCode,
      });
      keyStateManager.forceResolveHold(key); // タイマー停止 & resolvedマーク
      // 複数キーを順番に送信 (Tapとして完結させる)
      for (const remapKey of remapKeys) {
        debugLog("keyHandler.ts-remap-interrupted-sendKey-tap", { remapKey });
        sendKey(remapKey, false, "remap-interrupted-down");
        // sendKey(remapKey, true, "remap-interrupted-up");
      }
      return;
    }
    debugLog("keyHandler.ts-no-remap-found-for-hold-interruption", {
      key,
      currentVkCode,
    });
  }
}

/**
 * 保留中のタップキーを処理（割り込み入力時）
 * 異なるキーが押された場合、待機中のダブルタップ判定を即座に「タップ」として確定させる
 */
function processPendingTapKeys(currentVkCode: number): void {
  const pendingKeys = keyStateManager.getPendingTapKeys();
  if (pendingKeys.length > 0) {
    debugLog("keyHandler.ts-130-processPendingTapKeys", {
      pendingKeys,
      currentVkCode,
    });
  }

  for (const key of pendingKeys) {
    // 自分自身（同じキー）の連打はダブルタップ判定の一部なので割り込まない
    if (key === currentVkCode) {
      continue;
    }

    debugLog("keyHandler.ts-138-interrupt-pending-tap", {
      interruptedKey: key,
      byKey: currentVkCode,
    });

    // 強制的に解決
    const trigger = keyStateManager.forceResolveTap(key);
    if (trigger === "tap") {
      executeAction(key, "tap");
    }
  }
}

/**
 * キーアップイベントを処理
 */
export function handleKeyUp(vkCode: number): number {
  debugLog("keyHandler.ts-107-handleKeyUp-entry", { vkCode });
  // リマップ無効時はパススルー
  if (!remapEnabled) {
    debugLog("keyHandler.ts-109-remapDisabled");
    return 0;
  }

  releaseMomentaryLayer(vkCode);
  stopRemapAction(vkCode);

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
  debugLog("keyHandler.ts-132-keyTiming", keyTiming);
  const hasDoubleTapBinding = !!remapRules.getAction(vkCode, "doubleTap");
  const trigger = keyStateManager.onKeyUp(
    vkCode,
    hasDoubleTapBinding,
    keyTiming
  );
  debugLog("keyHandler.ts-134-onKeyUp-result", { trigger });

  // トリガーが null の場合は遅延発火待ち（コールバックで後から発火）
  if (trigger !== null) {
    debugLog("keyHandler.ts-141-executeAction", { trigger });
    executeAction(vkCode, trigger);
  } else {
    debugLog("keyHandler.ts-143-delayed-trigger-wait");
  }

  return 1;
}

/**
 * キーダウンイベントを処理
 */
export function handleKeyDown(vkCode: number): number {
  debugLog("keyHandler.ts-151-handleKeyDown-entry", { vkCode });
  // リマップ無効時はパススルー
  if (!remapEnabled) {
    debugLog("keyHandler.ts-153-remapDisabled");
    return 0;
  }

  // 1. 他のキーのダブルタップ待機を割り込み解決
  processPendingTapKeys(vkCode);

  // 2. 他のキーのホールド待機を処理
  processPendingHoldKeys(vkCode);

  const bindings = remapRules.getBindings(vkCode);

  // tap のみのバインディングを先に処理
  const tapResult = handleTapOnlyBindings(vkCode, bindings, false);
  if (tapResult !== null) {
    debugLog("keyHandler.ts-164-tapResult-handled", { tapResult });
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
  debugLog("keyHandler.ts-185-onKeyDown-call", keyTiming);
  keyStateManager.onKeyDown(vkCode, keyTiming);
  return 1;
}
