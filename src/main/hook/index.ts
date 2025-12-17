import type { KeyBinding, TriggerType } from "../../shared/types/remapConfig";
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
 * トリガーに対応するアクションを実行
 */
function executeAction(vkCode: number, trigger: TriggerType) {
  const action = remapRules.getAction(vkCode, trigger);
  if (!action) {
    sendKey(vkCode, true);
    return;
  }
  switch (action.type) {
    case "remap":
      sendKey(action.key, false);
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
}

const getHoldActionKey = (bindings: KeyBinding[], trigger: TriggerType) => {
  for (const binding of bindings) {
    if (binding.trigger === trigger && binding.action.type === "remap") {
      return binding.action.key;
    }
  }
  return null;
};

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

  // トリガー発火時のコールバックを設定（遅延発火用）
  keyStateManager.setTriggerCallback((code, trigger) => {
    executeAction(code, trigger);
  });

  registerKeyboardHook((vkCode, isUp) => {
    if (eventSender) {
      eventSender("key-event", { vkCode, isUp });
    }
    console.log("key", vkCode);
    if (isUp) {
      releaseMomentaryLayer(vkCode);
      // ダブルタップバインディングがあるか確認
      const hasDoubleTapBinding = !!remapRules.getAction(vkCode, "doubleTap");
      const trigger = keyStateManager.onKeyUp(vkCode, hasDoubleTapBinding);

      // トリガーが null の場合は遅延発火待ち（コールバックで後から発火）
      if (trigger !== null) {
        executeAction(vkCode, trigger);
      }

      return 1;
      // biome-ignore lint/style/noUselessElse: 排他的であるためif else が適当
    } else {
      const holdKeys = keyStateManager.getPendingHoldKeys();
      for (const key of holdKeys) {
        const bindings = remapRules.getBindings(key);

        const holdActionKey = getHoldActionKey(bindings, "hold");
        if (holdActionKey) {
          sendKey(holdActionKey, false);
        }
        const tapActionKey = getHoldActionKey(bindings, "tap");
        if (tapActionKey) {
          sendKey(tapActionKey, false);
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
