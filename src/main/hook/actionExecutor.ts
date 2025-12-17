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
 * バインディングから指定トリガーのリマップ先キーを取得
 */
export function getRemapKey(
  bindings: KeyBinding[],
  trigger: TriggerType
): number | null {
  for (const binding of bindings) {
    if (binding.trigger === trigger && binding.action.type === "remap") {
      return binding.action.key;
    }
  }
  return null;
}

/**
 * トリガーに対応するアクションを実行
 */
export function executeAction(vkCode: number, trigger: TriggerType) {
  const action = remapRules.getAction(vkCode, trigger);
  console.log("executeAction", vkCode, trigger, action);
  if (!action) {
    const bindings = remapRules.getBindings(vkCode);
    if (bindings.length !== 0) {
      sendKey(vkCode, false);
    }

    sendKey(vkCode, true);
    return;
  }
  switch (action.type) {
    case "remap":
      sendKey(action.key, false);
      sendKey(action.key, true);
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
