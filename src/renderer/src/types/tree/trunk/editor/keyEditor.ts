/**
 * KeyEditorActions関連の仲介型定義
 */

import type { UseKeyEditorActionsReturn } from "@/hooks/useKeyEditorAction";

/** キーエディタのアクション */
export type KeyEditorActions = Pick<
  UseKeyEditorActionsReturn,
  "canSave" | "handleSave" | "handleRemove" | "keys" | "setKeys" | "reset"
>;

/** キーの追加/削除のみ */
export type KeyEditorKeyActions = Pick<
  UseKeyEditorActionsReturn,
  "addHoldKey" | "removeHoldKey" | "removeKey"
>;

/** 保存可能状態のみ */
export type KeyEditorSaveState = Pick<
  UseKeyEditorActionsReturn,
  "canSave" | "handleSave" | "handleRemove"
>;
