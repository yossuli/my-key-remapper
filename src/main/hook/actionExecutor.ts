import type {
  Action,
  KeyBinding,
  TriggerType,
} from "@shared/types/remapConfig";
import { clickAt, getCursorPosition, moveMouse } from "../native/mouseSender";
import { sendKey } from "../native/sender";
import { remapRules } from "../state/rules";
import { debugLog } from "../utils/debugLogger";
import { buildModifierKeys } from "../utils/modifierKeys";

/**
 * アクションの実行とレイヤー管理
 */

/** レイヤーモーメンタリ用：どのキーがどのレイヤーを有効にしているか */
const momentaryLayerKeys = new Map<number, string>();

/** 現在押しっぱなし（Hold）状態のリマップキー（物理vkCode -> 送信中vkCode配列） */
const activeRemapKeys = new Map<number, number[]>();

/** リピート実行中のタイマー（物理vkCode -> Timeout/Interval ID） */
const repeatingTimers = new Map<number, NodeJS.Timeout>();

/**
 * リマップアクション（ホールド）を停止
 */
export function stopRemapAction(vkCode: number): void {
  // リピートタイマーがあれば停止
  if (repeatingTimers.has(vkCode)) {
    debugLog("actionExecutor.ts-stopRemapAction-clear-repeat", { vkCode });
    const timerId = repeatingTimers.get(vkCode);
    clearTimeout(timerId); // IntervalでもclearTimeoutで止まるが、厳密にはclearInterval推奨の場合もある
    clearInterval(timerId); // Node.js等ではどちらでも動くことが多いが念のため
    repeatingTimers.delete(vkCode);
  }

  const activeKeys = activeRemapKeys.get(vkCode);
  if (activeKeys) {
    debugLog("actionExecutor.ts-stopRemapAction-releasing", {
      vkCode,
      activeKeys,
    });
    // 逆順にキーアップを送信
    for (const key of activeKeys.toReversed()) {
      sendKey(key, true, "remap-stop");
    }
    activeRemapKeys.delete(vkCode);
  } else {
    // 頻繁に呼ばれるため、ログは出さないか、詳細な場合のみ
    // debugLog("actionExecutor.ts-stopRemapAction-no-active-keys", { vkCode });
  }
}

/**
 * 指定レイヤーのアクティブキーリスト（Modifiers + ActiveKeys）を取得
 */
function getLayerActiveKeys(layerId: string): number[] {
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
 * キーアップ時のモーメンタリレイヤー解除
 */
export function releaseMomentaryLayer(vkCode: number) {
  const layerId = momentaryLayerKeys.get(vkCode);
  if (layerId) {
    debugLog("actionExecutor.ts-19-releaseMomentaryLayer", {
      vkCode,
      layerId,
    });
    const layerKeys = getLayerActiveKeys(layerId);

    remapRules.popLayer(layerId);
    momentaryLayerKeys.delete(vkCode);

    // レイヤー設定に基づく修飾キーの解除（物理キーUP）
    // 押したときと逆順で離すのが一般的だが、同時押し解除なら順序はあまり問わない
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
    debugLog("actionExecutor.ts-36-addMomentaryLayer", { vkCode, layerId });

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
 * 現在のレイヤーに応じた修飾キー付きでキーを送信
 */
function sendKeyWithLayerModifiers(vkCode: number, isUp: boolean): void {
  const layer = remapRules.getCurrentLayer();
  const layerId = layer?.id;
  debugLog("actionExecutor.ts-59-sendKeyWithLayerModifiers", {
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
 * tap のみのバインディングを処理
 * keyDown/keyUp の両方で再利用される共通ロジック
 * @returns 処理した場合は 1、処理しなかった場合は null
 */
export function handleTapOnlyBindings(
  vkCode: number,
  bindings: KeyBinding[],
  isUp: boolean
): number | null {
  // tap 以外のトリガーがある場合は処理しない
  for (const { trigger } of bindings) {
    if (trigger !== "tap") {
      debugLog("actionExecutor.ts-88-handleTapOnlyBindings-skip-non-tap", {
        trigger,
      });
      return null;
    }
  }

  const action = remapRules.getAction(vkCode, "tap");

  // tap アクションがある場合
  if (action) {
    // remapアクションの場合はここで処理（修飾キーなしで送信）
    if (action.type === "remap") {
      debugLog("actionExecutor.ts-98-handleTapOnlyBindings-remap", { action });
      for (const key of action.keys) {
        sendKey(key, isUp);
      }
      return 1;
    }
    // remap以外（mouseMove等）の場合はexecuteActionInternalに委譲
    // isUpがtrueの場合のみ実行（キーアップ時に1回だけ実行）
    if (isUp) {
      debugLog("actionExecutor.ts-106-handleTapOnlyBindings-up-action", {
        action,
      });
      executeActionInternal(vkCode, "tap", action);
      return 1;
    }
    return 1;
  }

  // tap アクションがない場合、レイヤーの修飾キーを付与して送信
  debugLog("actionExecutor.ts-113-handleTapOnlyBindings-passthrough");
  sendKeyWithLayerModifiers(vkCode, isUp);
  return 1;
}

/**
 * アクションを実行する内部関数（再帰を避けるため）
 */
function executeActionInternal(
  vkCode: number,
  _trigger: TriggerType,
  action: NonNullable<ReturnType<typeof remapRules.getAction>>
): void {
  debugLog("actionExecutor.ts-124-executeActionInternal-start", {
    actionType: action.type,
  });
  switch (action.type) {
    case "mouseMove":
      moveMouse(action.x, action.y);
      break;
    case "mouseClick":
      clickAt(action.x, action.y, action.button, action.clickCount ?? 1);
      break;
    case "layerToggle":
      remapRules.setLayer(action.layerId);
      break;
    case "layerMomentary":
      addMomentaryLayer(vkCode, action.layerId);
      break;
    case "none":
      break;
    case "remap":
      // remapは既にhandleTapOnlyBindingsで処理済み
      break;
    case "cursorReturn": {
      // 現在のカーソル位置を記録
      const savedPosition = getCursorPosition();
      // 指定時間後に元の位置に戻す
      setTimeout(() => {
        moveMouse(savedPosition.x, savedPosition.y);
      }, action.delayMs);
      break;
    }
    default: {
      const _: never = action;
      break;
    }
  }
}

/**
 * トリガーに対応するアクションを実行
 */
export function executeAction(vkCode: number, trigger: TriggerType) {
  debugLog("actionExecutor.ts-163-executeAction-start", { vkCode, trigger });
  const action = remapRules.getAction(vkCode, trigger);
  const bindings = remapRules.getBindings(vkCode);

  // tap のみのバインディングを先に処理
  const tapResult = handleTapOnlyBindings(vkCode, bindings, true);
  if (tapResult !== null) {
    debugLog("actionExecutor.ts-169-executeAction-handled-by-tap-logic");
    return;
  }

  if (!action) {
    debugLog("actionExecutor.ts-173-executeAction-no-action");
    // アクションがない場合、レイヤーの修飾キーを付与して送信
    sendKeyWithLayerModifiers(vkCode, false);
    sendKeyWithLayerModifiers(vkCode, true);
    return;
  }

  executeActionInternal(vkCode, trigger, action);

  // remap アクションの場合の特別な処理
  if (action.type === "remap") {
    debugLog("actionExecutor.ts-executeAction-remap", {
      vkCode,
      trigger,
    });

    // 既存のアクションがあれば停止
    stopRemapAction(vkCode);

    const pressKeys = () => {
      debugLog("actionExecutor.ts-executeAction-remap-pressKeys", {
        keys: action.keys,
      });
      for (const key of action.keys) {
        sendKey(key, false, "remap-down");
      }
    };

    const releaseKeys = () => {
      debugLog("actionExecutor.ts-executeAction-remap-releaseKeys", {
        keys: action.keys,
      });
      for (const key of action.keys.toReversed()) {
        sendKey(key, true, "remap-up");
      }
    };

    if (trigger === "hold") {
      if (action.repeat) {
        debugLog("actionExecutor.ts-executeAction-remap-repeat-start", {
          vkCode,
          delay: action.repeatDelayMs,
          interval: action.repeatIntervalMs,
        });

        // 初回実行 (Tap)
        pressKeys();
        releaseKeys();

        const delay = action.repeatDelayMs ?? 500;
        const interval = action.repeatIntervalMs ?? 100;

        // 遅延後にリピート開始
        const timeoutId = setTimeout(() => {
          // 最初のinterval待ちを防ぐために即実行してもいいが、
          // 標準的なrepeatは delay -> (interval -> action) ...
          // ここでは delay -> action -> interval -> action ... としてみる
          debugLog("actionExecutor.ts-executeAction-remap-repeat-tick-initial");
          pressKeys();
          releaseKeys();

          const intervalId = setInterval(() => {
            debugLog("actionExecutor.ts-executeAction-remap-repeat-tick");
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
}
