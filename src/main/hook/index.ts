import type { EventSender } from "../ipc/types";
import { UnhookWindowsHookEx } from "../native/bindings";
import { sendKey } from "../native/sender";
import { KeyStateManager } from "../state/keyState";
import { remapRules } from "../state/rules";
import { addMomentaryLayer, releaseMomentaryLayer } from "./actionExecutor";
import { applyGlobalSettings, resetKeyState } from "./keyHandler";
import { clearHook, getHookHandle, registerKeyboardHook } from "./register";

const keyStateManager = new KeyStateManager();

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

  registerKeyboardHook((vkCode, isUp) => {
    if (eventSender) {
      eventSender("key-event", { vkCode, isUp });
    }
    if (isUp) {
      releaseMomentaryLayer(vkCode);
      const trigger = keyStateManager.onKeyUp(vkCode);
      const action = remapRules.getAction(vkCode, trigger);
      if (!action) {
        sendKey(vkCode, true);
        return 1;
      }
      switch (action.type) {
        case "remap":
          sendKey(action.key, true);
          break;
        case "layerToggle":
          remapRules.toggleLayer(action.layerId);
          break;
        case "layerMomentary":
          addMomentaryLayer(vkCode, action.layerId);
          break;
        case "none":
          break;
        default: {
          const _: never = action;
          break;
        }
      }
      return 1;
      // biome-ignore lint/style/noUselessElse: 排他的であるためif else が適当
    } else {
      const holdKeys = keyStateManager.getPendingHoldKeys();
      for (const key of holdKeys) {
        const action = remapRules.getAction(key, "hold");
        if (action?.type === "remap") {
          sendKey(action.key, false);
        }
      }
      const bindings = remapRules.getBindings(vkCode);
      if (bindings.length === 0) {
        sendKey(vkCode, false);
        return 1;
      }
      keyStateManager.onKeyDown(vkCode);
      return 1;
    }
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
