import koffi from "koffi";
import {
  KBDLLHOOKSTRUCT,
  WM_KEYDOWN,
  WM_KEYUP,
  WM_SYSKEYDOWN,
  WM_SYSKEYUP,
} from "./native/types";

/**
 * イベントのデコードとフィルタリング
 */

/**
 * キーダウン/キーアップイベントかどうかを判定
 */
export function isKeyEvent(wParam: number): boolean {
  return (
    wParam === WM_KEYDOWN ||
    wParam === WM_SYSKEYDOWN ||
    wParam === WM_KEYUP ||
    wParam === WM_SYSKEYUP
  );
}

/**
 * キーイベント情報をデコード
 */
export function decodeKeyEvent(
  // biome-ignore lint/suspicious/noExplicitAny: FFIデータは動的です
  lParam: any
): { vkCode: number; isUp: boolean; isInjected: boolean } | null {
  try {
    const info = koffi.decode(lParam, KBDLLHOOKSTRUCT);

    // 注入された（インジェクト）イベントを判定
    // biome-ignore lint/suspicious/noBitwiseOperators: フラグチェックにはビット演算が必要です
    const isInjected = (info.flags & 0x10) !== 0;

    return {
      vkCode: info.vkCode,
      isUp: false, // 呼び出し元で設定
      isInjected,
    };
  } catch (err) {
    console.error("Error decoding key event:", err);
    return null;
  }
}

/**
 * キーアップイベントかどうかを判定
 */
export function isKeyUpEvent(wParam: number): boolean {
  return wParam === WM_KEYUP || wParam === WM_SYSKEYUP;
}
