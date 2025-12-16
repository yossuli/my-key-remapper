import koffi from "koffi";
import {
  GetModuleHandleA,
  HookCallbackProto,
  SetWindowsHookExA,
} from "../native/bindings";
import { WH_KEYBOARD_LL } from "../native/types";

/**
 * フック登録の抽象化
 */

// biome-ignore lint/suspicious/noExplicitAny: FFIハンドルは緩いポインタです
let hHook: any = null;
// biome-ignore lint/suspicious/noExplicitAny: FFIコールバック
let hookCallback: any = null;

/**
 * キーボードフックを登録
 */
export function registerKeyboardHook(
  // biome-ignore lint/suspicious/noExplicitAny: FFIコールバック型
  callback: (nCode: number, wParam: number, lParam: any) => number
) {
  try {
    hookCallback = koffi.register(callback, koffi.pointer(HookCallbackProto));
    const hMod = GetModuleHandleA(null);
    hHook = SetWindowsHookExA(WH_KEYBOARD_LL, hookCallback, hMod, 0);

    if (hHook) {
      console.log("Keyboard hook installed successfully. Handle:", hHook);
    } else {
      console.error("Failed to install keyboard hook.");
    }
  } catch (error) {
    console.error("Failed to initialize FFI or Hook:", error);
  }
}

/**
 * 現在のフックハンドルを取得
 */
export function getHookHandle() {
  return hHook;
}

/**
 * フックを解除
 */
export function clearHook() {
  hHook = null;
  hookCallback = null;
}
