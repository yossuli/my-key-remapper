/**
 * QuickRemap関連の仲介型定義
 */

import type { UseQuickRemapReturn } from "@/hooks/useQuickRemap";

/** クイックリマップ制御 */
export type QuickRemapControl = Pick<
  UseQuickRemapReturn,
  "editingKey" | "startEditing" | "cancelEditing"
>;

/** クイック編集中キーの状態のみ */
export type QuickRemapState = Pick<UseQuickRemapReturn, "editingKey">;
