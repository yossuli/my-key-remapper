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

export function addMomentaryLayer(vkCode: number, layerId: string) {
  remapRules.pushLayer(layerId);
  momentaryLayerKeys.set(vkCode, layerId);
}

/**
 * アクションを実行
 */
// export function executeAction(vkCode: number, action: Action, isUp: boolean) {
//   console.log("action", action);
//   if (!action) {
//     return;
//   }

//   console.log(`[HOOK] Executing action: ${action.type} for key ${vkCode}`);

//   objectiveDiscriminantSwitch(
//     {
//       remap: (a) => {
//         if (a.modifiers) {
//           sendKeyWithModifiers(a.key, a.modifiers, isUp);
//         } else if (isUp) {
//           sendKey(a.key, false);
//           sendKey(a.key, true);
//         } else {
//           sendKey(a.key, false);
//         }
//       },
//       layerToggle: (a) => {
//         remapRules.toggleLayer(a.layerId);
//       },
//       layerMomentary: (a) => {
//         if (!isUp) {
//           remapRules.pushLayer(a.layerId);
//           momentaryLayerKeys.set(vkCode, a.layerId);
//         }
//       },
//       none() {
//         return;
//       },
//     },
//     action,
//     "type"
//   );
// }
