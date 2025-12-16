import koffi from "koffi";
import type { EventSender } from "../ipc/types";
import { CallNextHookEx, UnhookWindowsHookEx } from "../native/bindings";
import { decodeKeyEvent, isKeyEvent, isKeyUpEvent } from "./eventProcessor";
import { executeActionIfNeeded, updateMomentaryLayerState } from "./helpers";
import {
  applyGlobalSettings,
  handleKeyLogic,
  resetKeyState,
} from "./keyHandler";
import { clearHook, getHookHandle, registerKeyboardHook } from "./register";

/**
 * キーボードフックの設定と管理
 */

let eventSender: EventSender | null = null;

/**
 * キーボードフックをセットアップ
 */
export function setupKeyboardHook(sender: EventSender | null) {
  if (process.platform !== "win32") {
    console.log("Not on Windows, skipping keyboard hook setup.");
    return;
  }

  eventSender = sender;
  applyGlobalSettings();

  registerKeyboardHook((nCode, wParam, lParam) => {
    const hHook = getHookHandle();
    const next = () =>
      CallNextHookEx(hHook, nCode, wParam, koffi.address(lParam));

    if (nCode < 0) {
      return next();
    }
    if (!isKeyEvent(wParam)) {
      return next();
    }

    const eventInfo = decodeKeyEvent(lParam);
    if (!eventInfo || eventInfo.isInjected) {
      return next();
    }

    const { vkCode } = eventInfo;
    const isUp = isKeyUpEvent(wParam);

    updateMomentaryLayerState(vkCode, isUp);
    const result = handleKeyLogic(vkCode, isUp, eventSender);
    executeActionIfNeeded(result, vkCode, isUp);

    return result.shouldBlock ? 1 : next();
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
