// ActionからBindingStateへの変換ユーティリティ

import type { Action, ActionType } from "../../../shared/types/remapConfig";
import { objectiveDiscriminantSwitch } from "./objectiveSwitch";

export interface BindingState {
  actionType: ActionType;
  targetKeys: number[];
  selectedLayerId: string;
  hasExistingBinding: boolean;
}

/**
 * ActionからBindingStateへ変換
 */
export function actionToBindingState(action: Action): Partial<BindingState> {
  let result: Partial<BindingState> = {};

  objectiveDiscriminantSwitch(
    {
      remap: (act) => {
        result = { actionType: "remap", targetKeys: act.keys };
      },
      layerToggle: (act) => {
        result = { actionType: "layerToggle", selectedLayerId: act.layerId };
      },
      layerMomentary: (act) => {
        result = { actionType: "layerMomentary", selectedLayerId: act.layerId };
      },
      none: () => {
        result = { actionType: "none" };
      },
    },
    action,
    "type"
  );

  return result;
}

/**
 * 初期BindingStateを作成
 */
export function createInitialBindingState(
  defaultLayerId: string
): BindingState {
  return {
    actionType: "remap",
    targetKeys: [],
    selectedLayerId: defaultLayerId,
    hasExistingBinding: false,
  };
}
