import koffi from "koffi";
import type { ModifierOutput } from "../../../shared/types/remapConfig";
import { SendInput } from "./native";
import { INPUT, INPUT_KEYBOARD, KEYEVENTF_KEYUP } from "./types";

// 修飾キーのVKコード
const VK_LCTRL = 162;
const VK_RCTRL = 163;
const VK_LSHIFT = 160;
const VK_RSHIFT = 161;
const VK_LALT = 164;
const VK_RALT = 165;
const VK_LWIN = 91;
const VK_RWIN = 92;

export const sendKey = (vk: number, up: boolean) => {
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
 * 修飾キーのVKコードを取得
 */
function getModifierVk(
  value: boolean | "left" | "right",
  leftVk: number,
  rightVk: number
): number {
  return value === "right" ? rightVk : leftVk;
}

/**
 * 修飾キーの配列を生成
 */
function buildModifierKeys(modifiers: ModifierOutput): number[] {
  const keys: number[] = [];

  if (modifiers.ctrl) {
    keys.push(getModifierVk(modifiers.ctrl, VK_LCTRL, VK_RCTRL));
  }
  if (modifiers.shift) {
    keys.push(getModifierVk(modifiers.shift, VK_LSHIFT, VK_RSHIFT));
  }
  if (modifiers.alt) {
    keys.push(getModifierVk(modifiers.alt, VK_LALT, VK_RALT));
  }
  if (modifiers.win) {
    keys.push(getModifierVk(modifiers.win, VK_LWIN, VK_RWIN));
  }

  return keys;
}

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
