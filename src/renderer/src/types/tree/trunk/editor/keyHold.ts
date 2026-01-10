/**
 * KeyHoldAction関連の仲介型定義
 */

import type { UseKeyHoldActionReturn } from "@/hooks/useKeyHoldAction";

/** キー長押しアクションのハンドラ */
export type KeyHoldHandlers = Pick<
  UseKeyHoldActionReturn,
  "handleHoldKeyDown" | "handleHoldKeyUp" | "clearTimer"
>;

/** キー長押しの状態チェック */
export type KeyHoldState = Pick<
  UseKeyHoldActionReturn,
  "isActionReady" | "isKeyActive"
>;

/** キー長押しの全体制御 */
export type KeyHoldControl = Pick<
  UseKeyHoldActionReturn,
  | "handleHoldKeyDown"
  | "handleHoldKeyUp"
  | "clearTimer"
  | "isActionReady"
  | "isKeyActive"
>;
