/**
 * デバッグログの制御ユーティリティ
 * メモリ内でログ出力の有効/無効を管理する
 */

let isDebugEnabled = false;

/**
 * デバッグログの有効/無効を設定
 */
export function setDebugLogEnabled(enabled: boolean): void {
  isDebugEnabled = enabled;
  console.log(
    `[DebugLogger] Debug logging is now ${enabled ? "ENABLED" : "DISABLED"}`
  );
}

/**
 * デバッグログを出力（有効時のみ）
 */
// biome-ignore lint/suspicious/noExplicitAny: ログ出力は何でも受け取るため
export function debugLog(message: string, ...args: any[]): void {
  if (isDebugEnabled) {
    console.log(message, ...args);
  }
}

/**
 * ログを出力（デバッグログ無効時のみ）
 */
// biome-ignore lint/suspicious/noExplicitAny: ログ出力は何でも受け取るため
export function log(message: string, ...args: any[]): void {
  if (isDebugEnabled) {
    return;
  }
  console.log(message, ...args);
}
