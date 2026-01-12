import type { ActionType } from "@shared/types/remapConfig";

export const getLayerDescription = (actionType: ActionType) => {
  if (actionType === "layerToggle") {
    return "キーを押すとレイヤーをトグル切替します";
  }
  if (actionType === "layerMomentary") {
    return "キーを押している間だけレイヤーが有効になります";
  }
  return;
};
