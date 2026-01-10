/**
 * KeyEventLog関連の仲介型定義
 * UseKeyEventLogReturnからPickして作成
 */

import type { UseKeyEventLogReturn } from "@/hooks/useKeyEventLog";

/** ログ状態 */
export type LogState = Pick<UseKeyEventLogReturn, "logs">;

/** ログ制御 */
export type LogControl = Pick<UseKeyEventLogReturn, "logs" | "clearLogs">;
