import koffi from "koffi";
import {
  CallNextHookEx,
  GetModuleHandleA,
  HookCallbackProto,
  SetWindowsHookExA,
  UnhookWindowsHookEx,
} from "./native";
import { remapRules } from "./rules";
import { sendKey } from "./sender";
import {
  KBDLLHOOKSTRUCT,
  WH_KEYBOARD_LL,
  WM_KEYDOWN,
  WM_KEYUP,
  WM_SYSKEYDOWN,
  WM_SYSKEYUP,
} from "./types";

// biome-ignore lint/suspicious/noExplicitAny: FFIハンドルは緩いポインタです
let hHook: any = null;
// biome-ignore lint/suspicious/noExplicitAny: FFIコールバック
let hookCallback: any = null;
// biome-ignore lint/suspicious/noExplicitAny: データは動的です
type EventSender = ((channel: string, data: any) => void) | null;

export function setupKeyboardHook(sender: EventSender) {
  if (process.platform !== "win32") {
    console.log("Not on Windows, skipping keyboard hook setup.");
    return;
  }

  const eventSender = sender;

  try {
    hookCallback = koffi.register(
      // biome-ignore lint/suspicious/noExplicitAny: FFIコールバック引数
      (nCode: number, wParam: number, lParam: any) => {
        if (nCode < 0) {
          return CallNextHookEx(hHook, nCode, wParam, koffi.address(lParam));
        }

        if (isHorizontalKeyDownOrUp(wParam)) {
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

function isHorizontalKeyDownOrUp(wParam: number): boolean {
  return (
    wParam === WM_KEYDOWN ||
    wParam === WM_SYSKEYDOWN ||
    wParam === WM_KEYUP ||
    wParam === WM_SYSKEYUP
  );
}

function processKeyboardEvent(
  _nCode: number,
  wParam: number,
  // biome-ignore lint/suspicious/noExplicitAny: データは動的です
  lParam: any,
  eventSender: EventSender
): boolean {
  try {
    const info = koffi.decode(lParam, KBDLLHOOKSTRUCT);
    // 注入された（インジェクト）イベントを無視
    // biome-ignore lint/suspicious/noBitwiseOperators: フラグチェックにはビット演算が必要です
    if ((info.flags & 0x10) !== 0) {
      return false; // CallNextHookExへ進める
    }

    const vkCode = info.vkCode;
    const isUp = wParam === WM_KEYUP || wParam === WM_SYSKEYUP;

    if (handleKeyLogic(vkCode, isUp, eventSender)) {
      return true; // ブロックする
    }
  } catch (err) {
    console.error("Error inside hook callback:", err);
  }
  return false;
}

function handleKeyLogic(
  vkCode: number,
  isUp: boolean,
  eventSender: EventSender
): boolean {
  console.log(`[HOOK] Key ${isUp ? "Up" : "Down"}: ${vkCode}`);
  if (eventSender) {
    eventSender("key-event", { vkCode, isUp });
  }

  // リマップ処理
  const targetVk = remapRules.get(vkCode);
  if (targetVk !== undefined) {
    console.log(`Remapping ${vkCode} -> ${targetVk} (${isUp ? "UP" : "DOWN"})`);
    sendKey(targetVk, isUp);
    return true; // 元の入力をブロックする
  }
  return false;
}

export function teardownKeyboardHook() {
  if (hHook) {
    UnhookWindowsHookEx(hHook);
    hHook = null;
    hookCallback = null;
    console.log("Keyboard hook uninstalled.");
  }
}
