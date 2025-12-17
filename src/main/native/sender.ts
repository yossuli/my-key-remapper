import koffi from "koffi";
import type { ModifierOutput } from "../../shared/types/remapConfig";
import { buildModifierKeys } from "../utils/modifierKeys";
import { SendInput } from "./bindings";
import { INPUT, INPUT_KEYBOARD, KEYEVENTF_KEYUP } from "./types";

/**
 * キー送信機能
 */

export const sendKey = (vk: number, up: boolean) => {
  console.log("sendkey", vk, up ? "up" : "down");

  try {
    const input = {
      type: INPUT_KEYBOARD,
      u: {
        ki: {
          wVk: vk,
          wScan: 0,
          dwFlags: up ? KEYEVENTF_KEYUP : 0,
          time: 0,
          dwExtraInfo: 0,
        },
      },
    };

    // SendInputは挿入されたイベント数を返す
    const sent = SendInput(1, [input], koffi.sizeof(INPUT));
    if (sent !== 1) {
      console.error(`SendInput failed. Sent: ${sent}`);
    }
  } catch (e) {
    console.error("SendInput Error:", e);
  }
};

/**
 * 修飾キー付きでキーを送信
 */
export const sendKeyWithModifiers = (
  vk: number,
  modifiers: ModifierOutput,
  up: boolean
) => {
  const modifierKeys = buildModifierKeys(modifiers);

  // キーダウン：修飾キー→メインキー
  // キーアップ：メインキー→修飾キー（逆順）
  if (up) {
    sendKey(vk, true);
    for (const mod of modifierKeys.reverse()) {
      sendKey(mod, true);
    }
  } else {
    for (const mod of modifierKeys) {
      sendKey(mod, false);
    }
    sendKey(vk, false);
  }
};
