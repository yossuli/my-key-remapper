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
 * バインディングから指定トリガーのリマップ先キーを取得（複数キー対応）
 */
export function getRemapKeys(
  bindings: KeyBinding[],
  trigger: TriggerType
): number[] | null {
  for (const binding of bindings) {
    if (binding.trigger === trigger && binding.action.type === "remap") {
      return binding.action.keys;
    }
  }
  return null;
}

/**
 * トリガーに対応するアクションを実行
 */
export function executeAction(vkCode: number, trigger_: TriggerType) {
  const action = remapRules.getAction(vkCode, trigger_);
  const bindings = remapRules.getBindings(vkCode);
  const layerId = layerState.getStack().at(-1);
  console.log("executeAction", vkCode, trigger_, action, bindings);
  if (bindings.filter(({ trigger }) => trigger !== "tap").length === 0) {
    const _action = remapRules.getAction(vkCode, "tap");
    console.log(1);
    if (_action?.type === "remap") {
      console.log(2);
      for (const key of _action.keys) {
        sendKey(key, true, 1 + 6);
      }
      return 1;
    }
    console.log(3);
    if (layerId === "base") {
      sendKey(vkCode, true, 2 + 6);
      return 1;
    }
  }
  console.log(4);
  if (!action) {
    if (layerId === "base") {
      sendKey(vkCode, false, 2 + 6);
      sendKey(vkCode, true, 2 + 6);
      return 1;
    }
    return;
  }
  console.log(5);
  switch (action.type) {
    case "remap":
      // 複数キーを順番にdown、逆順でup
      for (const key of action.keys) {
        sendKey(key, false, 2 + 4);
      }
      for (const key of action.keys.toReversed()) {
        sendKey(key, true, 3 + 4);
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
