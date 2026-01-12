import type { RemapAction, TriggerType } from "@shared/types/remapConfig";
import { sendKey } from "../../native/sender";
import { remapRules } from "../../state/rules";
import { debugLog } from "../../utils/debugLogger";
import { buildModifierKeys } from "../../utils/modifierKeys";

const DEFAULT_REPEAT_DELAY_MS = 500;
const DEFAULT_REPEAT_INTERVAL_MS = 100;

/** 現在押しっぱなし（Hold）状態のリマップキー（物理vkCode -> 送信中vkCode配列） */
const activeRemapKeys = new Map<number, number[]>();

/** リピート実行中のタイマー（物理vkCode -> Timeout/Interval ID） */
const repeatingTimers = new Map<number, NodeJS.Timeout>();

/** レイヤーモーメンタリ用：どのキーがどのレイヤーを有効にしているか */
const momentaryLayerKeys = new Map<number, string>();

/**
 * 指定レイヤーのアクティブキーリスト（Modifiers + ActiveKeys）を取得
 */
export function getLayerActiveKeys(layerId: string): number[] {
  const layer = remapRules.getLayers().find((l) => l.id === layerId);
  if (!layer) {
    return [];
  }

  const keys = new Set<number>();

  // 1. defaultModifiers
  if (layer.defaultModifiers) {
    const modKeys = buildModifierKeys(layer.defaultModifiers);
    for (const k of modKeys) {
      keys.add(k);
    }
  }

  // 2. activeKeys
  if (layer.activeKeys) {
    for (const k of layer.activeKeys) {
      keys.add(k);
    }
  }

  return Array.from(keys);
}

/**
 * リマップアクション（ホールド）を停止
 */
export function stopRemapAction(vkCode: number): void {
  // リピートタイマーがあれば停止
  if (repeatingTimers.has(vkCode)) {
    debugLog("remapExecutor.ts-stopRemapAction-clear-repeat", { vkCode });
    const timerId = repeatingTimers.get(vkCode);
    clearTimeout(timerId);
    clearInterval(timerId);
    repeatingTimers.delete(vkCode);
  }

  const activeKeys = activeRemapKeys.get(vkCode);
  if (activeKeys) {
    debugLog("remapExecutor.ts-stopRemapAction-releasing", {
      vkCode,
      activeKeys,
    });
    // 逆順にキーアップを送信
    for (const key of activeKeys.toReversed()) {
      sendKey(key, true, "remap-stop");
    }
    activeRemapKeys.delete(vkCode);
  }
}

/**
 * リマップアクションを実行
 */
export function executeRemapAction(
  vkCode: number,
  trigger: TriggerType,
  action: RemapAction
) {
  debugLog("remapExecutor.ts-executeRemapAction", {
    vkCode,
    trigger,
  });

  // 既存のアクションがあれば停止
  stopRemapAction(vkCode);

  const pressKeys = () => {
    debugLog("remapExecutor.ts-executeRemapAction-pressKeys", {
      keys: action.keys,
    });
    for (const key of action.keys) {
      sendKey(key, false, "remap-down");
    }
  };

  const releaseKeys = () => {
    debugLog("remapExecutor.ts-executeRemapAction-releaseKeys", {
      keys: action.keys,
    });
    for (const key of action.keys.toReversed()) {
      sendKey(key, true, "remap-up");
    }
  };

  if (trigger === "hold") {
    if (action.repeat) {
      debugLog("remapExecutor.ts-executeRemapAction-repeat-start", {
        vkCode,
        delay: action.repeatDelayMs,
        interval: action.repeatIntervalMs,
      });

      // 初回実行 (Tap)
      pressKeys();
      releaseKeys();

      const delay = action.repeatDelayMs ?? DEFAULT_REPEAT_DELAY_MS;
      const interval = action.repeatIntervalMs ?? DEFAULT_REPEAT_INTERVAL_MS;

      // 遅延後にリピート開始
      const timeoutId = setTimeout(() => {
        debugLog("remapExecutor.ts-executeRemapAction-repeat-tick-initial");
        pressKeys();
        releaseKeys();

        const intervalId = setInterval(() => {
          debugLog("remapExecutor.ts-executeRemapAction-repeat-tick");
          pressKeys();
          releaseKeys();
        }, interval);

        repeatingTimers.set(vkCode, intervalId);
      }, delay);

      repeatingTimers.set(vkCode, timeoutId);
    } else {
      // 押しっぱなしにする (デフォルト)
      pressKeys();
      activeRemapKeys.set(vkCode, [...action.keys]);
    }
  } else {
    // tap / doubleTap は1回だけ叩く
    pressKeys();
    releaseKeys();
  }
}

/**
 * キーアップ時のモーメンタリレイヤー解除
 */
export function releaseMomentaryLayer(vkCode: number) {
  const layerId = momentaryLayerKeys.get(vkCode);
  if (layerId) {
    debugLog("remapExecutor.ts-releaseMomentaryLayer", {
      vkCode,
      layerId,
    });
    const layerKeys = getLayerActiveKeys(layerId);

    remapRules.popLayer(layerId);
    momentaryLayerKeys.delete(vkCode);

    // レイヤー設定に基づく修飾キーの解除（物理キーUP）
    for (const vk of layerKeys.toReversed()) {
      sendKey(vk, true, "layer-remove");
    }
  }
}

/**
 * モーメンタリレイヤーを追加
 */
export function addMomentaryLayer(vkCode: number, layerId: string) {
  const isLayerSetCurrent = momentaryLayerKeys.get(vkCode);
  if (isLayerSetCurrent === undefined) {
    debugLog("remapExecutor.ts-addMomentaryLayer", { vkCode, layerId });

    const layerKeys = getLayerActiveKeys(layerId);

    remapRules.pushLayer(layerId);
    momentaryLayerKeys.set(vkCode, layerId);

    // レイヤー設定に基づく修飾キーの送信（物理キーDOWN）
    for (const vk of layerKeys) {
      sendKey(vk, false, "layer-add");
    }
  }
}

/**
 * 指定キーがモーメンタリレイヤーを発火中かどうか
 */
export function isLayerMomentaryKey(vkCode: number): boolean {
  return momentaryLayerKeys.has(vkCode);
}

/**
 * レイヤーキーと一緒にキーを送信するヘルパー
 */
function sendLayerKeys(vkCode: number, isUp: boolean, layerKeys: number[]) {
  if (isUp) {
    // keyUp: キーを離してから アクティブキー を離す
    sendKey(vkCode, true);
    for (const vk of layerKeys.toReversed()) {
      sendKey(vk, true);
    }
  } else {
    // keyDown: アクティブキー を押してから キーを押す
    for (const vk of layerKeys) {
      sendKey(vk, false);
    }
    sendKey(vkCode, false);
  }
}

/**
 * 現在のレイヤーに応じた修飾キー付きでキーを送信
 */
export function sendKeyWithLayerModifiers(vkCode: number, isUp: boolean): void {
  const layer = remapRules.getCurrentLayer();
  const layerId = layer?.id;
  debugLog("remapExecutor.ts-sendKeyWithLayerModifiers", {
    vkCode,
    isUp,
    layerId,
  });

  const layerKeys = layerId ? getLayerActiveKeys(layerId) : [];

  if (layerKeys.length > 0) {
    sendLayerKeys(vkCode, isUp, layerKeys);
  } else {
    sendKey(vkCode, isUp);
  }
}
