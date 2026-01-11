// ActionからBindingStateへの変換ユーティリティ

import { objectiveDiscriminantSwitch } from "@/utils/objectiveSwitch";
import type { Action, ActionType } from "../../../shared/types/remapConfig";

export interface BindingState {
  actionType: ActionType;
  targetKeys: number[];
  selectedLayerId: string;
  hasExistingBinding: boolean;
  mouseX?: number;
  mouseY?: number;
  mouseButton?: "left" | "right" | "middle";
  clickCount?: number;
  cursorReturnDelayMs?: number;
  repeat?: boolean;
  repeatDelayMs?: number;
  repeatIntervalMs?: number;
}

/**
 * ActionからBindingStateへ変換
 */
export function actionToBindingState(action: Action): Partial<BindingState> {
  return objectiveDiscriminantSwitch(
    {
      remap: (act) => ({
        actionType: "remap",
        targetKeys: act.keys,
        repeat: act.repeat,
        repeatDelayMs: act.repeatDelayMs,
        repeatIntervalMs: act.repeatIntervalMs,
      }),
      layerToggle: (act) => ({
        actionType: "layerToggle",
        selectedLayerId: act.layerId,
      }),
      layerMomentary: (act) => ({
        actionType: "layerMomentary",
        selectedLayerId: act.layerId,
      }),
      mouseMove: (act) => ({
        actionType: "mouseMove",
        mouseX: act.x,
        mouseY: act.y,
      }),
      mouseClick: (act) => ({
        actionType: "mouseClick",
        mouseX: act.x,
        mouseY: act.y,
        mouseButton: act.button,
        clickCount: act.clickCount ?? 1,
      }),
      none: () => ({ actionType: "none" }),
      cursorReturn: (act) => ({
        actionType: "cursorReturn",
        cursorReturnDelayMs: act.delayMs,
      }),
    },
    action,
    "type"
  );
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
    repeat: false,
    repeatDelayMs: 500,
    repeatIntervalMs: 100,
  };
}
