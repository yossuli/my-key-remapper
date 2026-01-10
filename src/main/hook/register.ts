import koffi from "koffi";
import {
  CallNextHookEx,
  GetModuleHandleA,
  HookCallbackProto,
  SetWindowsHookExA,
} from "../native/bindings";
import { WH_KEYBOARD_LL } from "../native/types";
import { debugLog } from "../utils/debugLogger";
import { decodeKeyEvent, isKeyEvent, isKeyUpEvent } from "./eventProcessor";

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
  callback: (vkCode: number, isUp: boolean) => number
) {
  debugLog("register.ts-23-registerKeyboardHook-start");
  // biome-ignore lint/suspicious/noExplicitAny: FFIコールバック型
  const outerCallback = (nCode: number, wParam: number, lParam: any) => {
    debugLog("register.ts-27-outerCallback-entry", { nCode, wParam });
    const next = () => {
      debugLog("register.ts-29-next-call");
      return CallNextHookEx(hHook, nCode, wParam, koffi.address(lParam));
    };
    if (nCode < 0) {
      debugLog("register.ts-30-nCode-negative");
      return next();
    }
    if (!isKeyEvent(wParam)) {
      debugLog("register.ts-33-not-key-event");
      return next();
    }
    const eventInfo = decodeKeyEvent(lParam);
    if (!eventInfo || eventInfo.isInjected) {
      debugLog("register.ts-37-injected-or-invalid", eventInfo);
      return next();
    }

    const { vkCode } = eventInfo;
    const isUp = isKeyUpEvent(wParam);

    debugLog("register.ts-43-calling-callback", { vkCode, isUp });
    return callback(vkCode, isUp);
  };
  try {
    hookCallback = koffi.register(
      outerCallback,
      koffi.pointer(HookCallbackProto)
    );
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
