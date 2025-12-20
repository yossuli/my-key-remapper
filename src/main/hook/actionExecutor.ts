import { VK } from "../../shared/constants";
import type { KeyBinding, TriggerType } from "../../shared/types/remapConfig";
import { sendKey } from "../native/sender";
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
      sendKey(key, isUp, 1);
    }
    return 1;
  }

  const layer = remapRules.getCurrentLayer();
  const layerId = layer?.id;
  console.log("layer", layerId);

  // tap アクションがない場合、レイヤーの defaultModifiers を考慮
  if (layerId === "shift") {
    if (isUp) {
      // keyUp: キーを離してから Shift を離す
      sendKey(vkCode, true, 2);
      sendKey(VK.SHIFT, true, 3);
    } else {
      // keyDown: Shift を押してからキーを押す
      sendKey(VK.SHIFT, false, 4);
      sendKey(vkCode, false, 5);
    }
    return 1;
  }

  if (layerId === "base") {
    sendKey(vkCode, isUp, 6);
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
  console.log("executeAction", vkCode);

  // tap のみのバインディングを先に処理
  const tapResult = handleTapOnlyBindings(vkCode, bindings, true);
  if (tapResult !== null) {
    return tapResult;
  }

  const layer = remapRules.getCurrentLayer();
  const layerId = layer?.id;
  if (!action) {
    if (layerId === "base") {
      sendKey(vkCode, false, 7);
      sendKey(vkCode, true, 8);
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
