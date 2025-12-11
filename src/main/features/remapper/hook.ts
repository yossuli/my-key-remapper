import koffi from "koffi";
import type { Action } from "../../../shared/types/remapConfig";
import { keyStateManager } from "./keyState";
import {
  CallNextHookEx,
  GetModuleHandleA,
  HookCallbackProto,
  SetWindowsHookExA,
  UnhookWindowsHookEx,
} from "./native";
import { remapRules } from "./rules";
import { sendKey, sendKeyWithModifiers } from "./sender";
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

/** レイヤーモーメンタリー用：どのキーがどのレイヤーを有効にしているか */
const momentaryLayerKeys = new Map<number, string>();

export function setupKeyboardHook(sender: EventSender) {
  if (process.platform !== "win32") {
    console.log("Not on Windows, skipping keyboard hook setup.");
    return;
  }

  const eventSender = sender;

  // グローバル設定を適用
  const settings = remapRules.getGlobalSettings();
  keyStateManager.setThresholds(
    settings.defaultHoldThresholdMs,
    settings.defaultTapIntervalMs
  );

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
      return false;
    }

    const vkCode = info.vkCode;
    const isUp = wParam === WM_KEYUP || wParam === WM_SYSKEYUP;

    return handleKeyLogic(vkCode, isUp, eventSender);
  } catch (err) {
    console.error("Error inside hook callback:", err);
  }
  return false;
}

/**
 * 修飾キーかどうかを判定
 * 修飾キーは長押し判定を無効化する（Windowsの特殊な動作のため）
 */
function isModifierKey(vkCode: number): boolean {
  return (
    vkCode === 16 || // VK_SHIFT
    vkCode === 17 || // VK_CONTROL
    vkCode === 18 || // VK_MENU (Alt)
    vkCode === 91 || // VK_LWIN
    vkCode === 92 || // VK_RWIN
    (vkCode >= 160 && vkCode <= 165) // VK_LSHIFT, VK_RSHIFT, VK_LCONTROL, VK_RCONTROL, VK_LMENU, VK_RMENU
  );
}

function handleKeyLogic(
  vkCode: number,
  isUp: boolean,
  eventSender: EventSender
): boolean {
  // UIにイベントを通知
  if (eventSender) {
    eventSender("key-event", { vkCode, isUp });
  }

  if (isUp) {
    return handleKeyUp(vkCode);
  }
  return handleKeyDown(vkCode);
}

function handleKeyDown(vkCode: number): boolean {
  // 修飾キーの場合はhold判定を無効化
  if (isModifierKey(vkCode)) {
    // 修飾キーは通常のキー入力として扱う（hold判定しない）
    return false;
  }

  // キー状態を更新（ホールド判定のみ）
  keyStateManager.onKeyDown(vkCode, () => {
    // ホールドタイマーが発火した時はログ出力のみ
    console.log(`[HOOK] Hold detected for key ${vkCode}`);
  });

  // キーダウン時点ではまだアクションを実行しない（ホールド判定待ち）
  // holdバインディングのみの場合はデフォルトのキー入力を通す
  // tap/doubleTap/tapHoldバインディングがある場合のみブロックする
  const bindings = remapRules.getBindings(vkCode);
  const hasNonHoldBinding = bindings.some(
    (b) =>
      b.trigger === "tap" ||
      b.trigger === "doubleTap" ||
      b.trigger === "tapHold"
  );

  if (hasNonHoldBinding) {
    console.log(`[HOOK] Key Down blocked (has non-hold bindings): ${vkCode}`);
    return true;
  }

  // holdのみの場合はデフォルトのキー入力を通す
  return false;
}

function handleKeyUp(vkCode: number): boolean {
  // モーメンタリーレイヤーの解除
  const layerId = momentaryLayerKeys.get(vkCode);
  if (layerId) {
    remapRules.popLayer(layerId);
    momentaryLayerKeys.delete(vkCode);
  }

  // トリガーを判定
  const trigger = keyStateManager.onKeyUp(vkCode);
  console.log(`[HOOK] Key Up: ${vkCode}, trigger: ${trigger}`);

  // ホールドが発火済みの場合は、ここでは何もしない（既に処理済み）
  if (trigger === "hold") {
    return true;
  }

  // アクションを取得して実行
  const keyAction = remapRules.getAction(vkCode, trigger);
  if (keyAction) {
    executeAction(keyAction, vkCode, true);
    return true;
  }

  // バインディングがないのでキーを通す
  return false;
}

function executeAction(act: Action, vkCode: number, isUp: boolean) {
  console.log(`[HOOK] Executing action: ${act.type} for key ${vkCode}`);

  if (act.type === "remap") {
    if (act.modifiers) {
      sendKeyWithModifiers(act.key, act.modifiers, isUp);
    } else if (isUp) {
      sendKey(act.key, false);
      sendKey(act.key, true);
    } else {
      sendKey(act.key, false);
    }
    return;
  }

  if (act.type === "layerToggle") {
    remapRules.toggleLayer(act.layerId);
    return;
  }

  if (act.type === "layerMomentary") {
    if (!isUp) {
      remapRules.pushLayer(act.layerId);
      momentaryLayerKeys.set(vkCode, act.layerId);
    }
    return;
  }

  if (act.type === "macro") {
    console.log("Macro execution not yet implemented");
    return;
  }

  // none と passthrough は何もしない
}

export function teardownKeyboardHook() {
  if (hHook) {
    UnhookWindowsHookEx(hHook);
    hHook = null;
    hookCallback = null;
    keyStateManager.reset();
    console.log("Keyboard hook uninstalled.");
  }
}
