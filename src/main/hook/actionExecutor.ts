import type { KeyBinding, TriggerType } from "../../shared/types/remapConfig";
import { sendKey } from "../native/sender";
import { layerState } from "../state/layerState";
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
}

/**
 * tap のみのバインディングを処理
 * keyDown/keyUp の両方で再利用される共通ロジック
 * @returns 処理した場合は 1、処理しなかった場合は null
 */
export function handleTapOnlyBindings(
  vkCode: number,
  bindings: KeyBinding[],
  isUp: boolean,
  debugInfo?: number
): number | null {
  // tap 以外のトリガーがある場合は処理しない
  for (const { trigger } of bindings) {
    if (trigger !== "tap") {
      return null;
    }
  }

  const action = remapRules.getAction(vkCode, "tap");
  if (action?.type === "remap") {
    for (const key of action.keys) {
      sendKey(key, isUp, debugInfo);
    }
    return 1;
  }

  const layerId = layerState.getStack().at(-1);
  if (layerId === "base") {
    sendKey(vkCode, isUp, debugInfo);
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

  const layerId = layerState.getStack().at(-1);
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
