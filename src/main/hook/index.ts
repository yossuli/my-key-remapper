import type { EventSender } from "../ipc/types";
import { UnhookWindowsHookEx } from "../native/bindings";
import { debugLog } from "../utils/debugLogger";
import {
  applyGlobalSettings,
  handleKeyDown,
  handleKeyUp,
  resetKeyState,
  setupTriggerCallback,
} from "./keyHandler";
import { clearHook, getHookHandle, registerKeyboardHook } from "./register";

/**
 * キーボードフックの設定と管理
 */

let eventSender: EventSender | null = null;

/**
 * キーボードフックをセットアップ
 */
export function setupKeyboardHook(sender: EventSender) {
  debugLog("index.ts-21-setupKeyboardHook-entry");
  if (process.platform !== "win32") {
    console.log("Not on Windows, skipping keyboard hook setup.");
    return;
  }

  eventSender = sender;
  applyGlobalSettings();
  setupTriggerCallback();

  registerKeyboardHook((vkCode, isUp) => {
    debugLog("index.ts-31-callback-entry", { vkCode, isUp });
    if (eventSender) {
      debugLog("index.ts-33-ipc-send-start", { vkCode, isUp });
      eventSender("key-event", { vkCode, isUp });
      debugLog("index.ts-34-ipc-send-end");
    }
    return isUp ? handleKeyUp(vkCode) : handleKeyDown(vkCode);
  });
}

/**
 * キーボードフックを解除
 */
export function teardownKeyboardHook() {
  const hHook = getHookHandle();
  if (hHook) {
    UnhookWindowsHookEx(hHook);
    clearHook();
    eventSender = null;
    resetKeyState();
    console.log("Keyboard hook uninstalled.");
  }
}
