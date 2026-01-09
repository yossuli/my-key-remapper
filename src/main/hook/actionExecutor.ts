import { VK } from "../../shared/constants";
import type { KeyBinding, TriggerType } from "../../shared/types/remapConfig";
import { sendKey } from "../native/sender";
import { moveMouse } from "../native/mouseSender";
import { remapRules } from "../state/rules";

/**
 * アクションの実行とレイヤー管理
 */

/** レイヤーモーメンタリー用：どのキーがどのレイヤーを有効にしているか */
const momentaryLayerKeys = new Map<number, string>();

/**
 * キーアップ時のモーメンタリーレイヤー解除
 */
export function releaseMomentaryLayer(vkCode: number) {
  const layerId = momentaryLayerKeys.get(vkCode);
  if (layerId) {
    remapRules.popLayer(layerId);
    momentaryLayerKeys.delete(vkCode);
  }
  if (layerId === "shift") {
    sendKey(VK.SHIFT, true, "layer-remove");
  }
}

/**
 * モーメンタリーレイヤーを追加
 */
export function addMomentaryLayer(vkCode: number, layerId: string) {
  const isLayerSetCurrent = momentaryLayerKeys.get(vkCode);
  if (isLayerSetCurrent === undefined) {
    remapRules.pushLayer(layerId);
    momentaryLayerKeys.set(vkCode, layerId);
  }
  if (layerId === "shift") {
    sendKey(VK.SHIFT, false, "layer-add");
  }
}

/**
 * 指定キーがモーメンタリーレイヤーを発動中かどうか
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

  if (layerId === "shift") {
    sendKey(VK.SHIFT, true, "shift key");
    if (isUp) {
      // keyUp: キーを離してから Shift を離す
      sendKey(vkCode, true);
      sendKey(VK.SHIFT, true);
    } else {
      // keyDown: Shift を押してからキーを押す
      sendKey(VK.SHIFT, false);
      sendKey(vkCode, false);
    }
  } else {
    sendKey(vkCode, isUp);
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
      return null;
    }
  }

  const action = remapRules.getAction(vkCode, "tap");

  // tap アクションがある場合
  if (action) {
    // remapアクションの場合はここで処理（修飾キーなしで送信）
    if (action.type === "remap") {
      for (const key of action.keys) {
        sendKey(key, isUp);
      }
      return 1;
    }
    // remap以外（mouseMove等）の場合はexecuteActionに委譲
    // isUpがtrueの場合のみ実行（キーアップ時に1回だけ実行）
    if (isUp) {
      executeActionInternal(vkCode, "tap", action);
      return 1;
    }
    return 1;
  }

  // tap アクションがない場合、レイヤーの修飾キーを付与して送信
  sendKeyWithLayerModifiers(vkCode, isUp);
  return 1;
}

/**
 * アクションを実行する内部関数（再帰を避けるため）
 */
function executeActionInternal(
  vkCode: number,
  trigger: TriggerType,
  action: NonNullable<ReturnType<typeof remapRules.getAction>>
): void {
  switch (action.type) {
    case "mouseMove":
      console.log("mouseMove", action.x, action.y);
      moveMouse(action.x, action.y);
      break;
    case "layerToggle":
      remapRules.setLayer(action.layerId);
      break;
    case "layerMomentary":
      releaseMomentaryLayer(vkCode);
      break;
    case "none":
      break;
    case "remap":
      // remapは既にhandleTapOnlyBindingsで処理済み
      break;
    default: {
      const _: never = action;
      break;
    }
  }
}

/**
 * トリガーに対応するアクションを実行
 */
export function executeAction(vkCode: number, trigger_: TriggerType) {
  const action = remapRules.getAction(vkCode, trigger_);
  const bindings = remapRules.getBindings(vkCode);

  // tap のみのバインディングを先に処理
  const tapResult = handleTapOnlyBindings(vkCode, bindings, true);
  if (tapResult !== null) {
    return tapResult;
  }

  const layer = remapRules.getCurrentLayer();
  const layerId = layer?.id;
  if (!action) {
    // アクションがない場合、レイヤーの修飾キーを付与して送信
    if (layerId === "base" || layerId === "shift") {
      sendKeyWithLayerModifiers(vkCode, false);
      sendKeyWithLayerModifiers(vkCode, true);
      return 1;
    }
    return;
  }
  switch (action.type) {
    case "remap":
      // 複数キーを順番にdown、逆順でup
      for (const key of action.keys) {
        sendKey(key, false, 9);
      }
      for (const key of action.keys.toReversed()) {
        sendKey(key, true, 10);
      }
      break;
    case "mouseMove":
      moveMouse(action.x, action.y);
      break;
    case "layerToggle":
      remapRules.setLayer(action.layerId);
      break;
    case "layerMomentary":
      releaseMomentaryLayer(vkCode);
      break;
    case "none":
      break;
    default: {
      const _: never = action;
      break;
    }
  }
}
