/**
 * Remap制御関連の仲介型定義
 */

import type { UseRemapControlReturn } from "@/hooks/useRemapControl";

/** リマップ制御の基本状態 */
export type RemapState = Pick<UseRemapControlReturn, "isActive">;

/** リマップ制御のアクション */
export type RemapActions = Pick<
  UseRemapControlReturn,
  "toggleActive" | "enableRemap" | "disableRemap"
>;

/** リマップ制御の全体 */
export type RemapControl = RemapState & RemapActions;
