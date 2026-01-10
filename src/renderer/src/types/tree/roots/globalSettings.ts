/**
 * GlobalSettings関連の仲介型定義
 * UseGlobalSettingsReturnからPickして作成
 */

import type { UseGlobalSettingsReturn } from "@/hooks/useGlobalSettings";

/** グローバル設定の状態と更新 */
export type GlobalSettingsControl = Pick<
  UseGlobalSettingsReturn,
  "globalSettings" | "updateGlobalSettings"
>;

/** グローバル設定の状態のみ */
export type GlobalSettingsState = Pick<
  UseGlobalSettingsReturn,
  "globalSettings"
>;
