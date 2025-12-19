import type { EventSender } from "../ipc/types";
import { UnhookWindowsHookEx } from "../native/bindings";
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
  if (process.platform !== "win32") {
    console.log("Not on Windows, skipping keyboard hook setup.");
    return;
  }

  eventSender = sender;
  applyGlobalSettings();
  setupTriggerCallback();

  registerKeyboardHook((vkCode, isUp) => {
    if (eventSender) {
      eventSender("key-event", { vkCode, isUp });
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
