import koffi from "koffi";
import { executeAction, releaseMomentaryLayer } from "./actionExecutor";
import { decodeKeyEvent, isKeyEvent, isKeyUpEvent } from "./eventProcessor";
import type { EventSender } from "./ipc/types";
import {
  applyGlobalSettings,
  handleKeyLogic,
  resetKeyState,
} from "./keyHandler";
import {
  CallNextHookEx,
  GetModuleHandleA,
  HookCallbackProto,
  SetWindowsHookExA,
  UnhookWindowsHookEx,
} from "./native/bindings";
import { WH_KEYBOARD_LL } from "./native/types";

/**
 * キーボードフックの設定と管理
 */

// biome-ignore lint/suspicious/noExplicitAny: FFIハンドルは緩いポインタです
let hHook: any = null;
// biome-ignore lint/suspicious/noExplicitAny: FFIコールバック
let hookCallback: any = null;

/**
 * キーボードフックをセットアップ
 */
export function setupKeyboardHook(sender: EventSender | null) {
  if (process.platform !== "win32") {
    console.log("Not on Windows, skipping keyboard hook setup.");
    return;
  }

  const eventSender = sender;

  // グローバル設定を適用
  applyGlobalSettings();

  try {
    hookCallback = koffi.register(
      // biome-ignore lint/suspicious/noExplicitAny: FFIコールバック引数
      (nCode: number, wParam: number, lParam: any) => {
        if (nCode < 0) {
          return CallNextHookEx(hHook, nCode, wParam, koffi.address(lParam));
        }

        if (isKeyEvent(wParam)) {
          const blocked = processKeyboardEvent(
            nCode,
            wParam,
            lParam,
            eventSender
          );
          if (blocked) {
            return 1;
          }
        }

        return CallNextHookEx(hHook, nCode, wParam, koffi.address(lParam));
      },
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
 * キーボードイベントを処理
 */
function processKeyboardEvent(
  _nCode: number,
  wParam: number,
  // biome-ignore lint/suspicious/noExplicitAny: データは動的です
  lParam: any,
  eventSender: EventSender | null
): boolean {
  try {
    const eventInfo = decodeKeyEvent(lParam);
    if (!eventInfo) {
      return false;
    }

    // 注入された（インジェクト）イベントを無視
    if (eventInfo.isInjected) {
      return false;
    }

    const vkCode = eventInfo.vkCode;
    const isUp = isKeyUpEvent(wParam);

    // モーメンタリーレイヤーの解除（キーアップ時）
    if (isUp) {
      releaseMomentaryLayer(vkCode);
    }

    // キーロジックを処理
    const result = handleKeyLogic(vkCode, isUp, eventSender);

    // アクションを実行
    if (result.hasAction && result.trigger) {
      executeAction(vkCode, result.trigger, isUp);
    }

    return result.shouldBlock;
  } catch (err) {
    console.error("Error inside hook callback:", err);
  }
  return false;
}

/**
 * キーボードフックを解除
 */
export function teardownKeyboardHook() {
  if (hHook) {
    UnhookWindowsHookEx(hHook);
    hHook = null;
    hookCallback = null;
    resetKeyState();
    console.log("Keyboard hook uninstalled.");
  }
}
