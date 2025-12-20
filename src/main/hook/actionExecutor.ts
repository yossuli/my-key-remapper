import type { KeyBinding, TriggerType } from "../../shared/types/remapConfig";
import { sendKey } from "../native/sender";
import { remapRules } from "../state/rules";
import { VK_LSHIFT, VK_RSHIFT } from "../utils/modifierKeys";

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
    console.log("releaseMomentaryLayer");
    remapRules.popLayer(layerId);
    momentaryLayerKeys.delete(vkCode);
  }
}

/**
 * モーメンタリーレイヤーを追加
 */
export function addMomentaryLayer(vkCode: number, layerId: string) {
  const isLayerSetCurrent = momentaryLayerKeys.get(vkCode);
  if (isLayerSetCurrent === undefined) {
    console.log("addMomentaryLayer");
    remapRules.pushLayer(layerId);
    momentaryLayerKeys.set(vkCode, layerId);
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

  // tap アクションがある場合（修飾キーなしで送信）
  if (action?.type === "remap") {
    for (const key of action.keys) {
      sendKey(key, isUp);
    }
    return 1;
  }

  const layer = remapRules.getCurrentLayer();
  const layerId = layer?.id;

  // tap アクションがない場合、レイヤーの defaultModifiers を考慮
  if (layer?.defaultModifiers?.shift) {
    const shiftVk =
      layer.defaultModifiers.shift === "right" ? VK_RSHIFT : VK_LSHIFT;
    if (isUp) {
      // keyUp: キーを離してから Shift を離す
      sendKey(vkCode, true);
      sendKey(shiftVk, true);
    } else {
      // keyDown: Shift を押してからキーを押す
      sendKey(shiftVk, false);
      sendKey(vkCode, false);
    }
    return 1;
  }

  if (layerId === "base") {
    sendKey(vkCode, isUp);
    return 1;
  }

  return isUp ? null : 1;
}

/**
 * トリガーに対応するアクションを実行
 */
export function executeAction(vkCode: number, trigger_: TriggerType) {
  const action = remapRules.getAction(vkCode, trigger_);
  const bindings = remapRules.getBindings(vkCode);
  console.log("executeAction", vkCode, trigger_, action, bindings);

  // tap のみのバインディングを先に処理
  const tapResult = handleTapOnlyBindings(vkCode, bindings, true);
  if (tapResult !== null) {
    return tapResult;
  }

  const layer = remapRules.getCurrentLayer();
  const layerId = layer?.id;
  if (!action) {
    if (layerId === "base") {
      sendKey(vkCode, false);
      sendKey(vkCode, true);
      return 1;
    }
    return;
  }
  switch (action.type) {
    case "remap":
      // 複数キーを順番にdown、逆順でup
      for (const key of action.keys) {
        sendKey(key, false);
      }
      for (const key of action.keys.toReversed()) {
        sendKey(key, true);
      }
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
