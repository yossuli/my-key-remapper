import koffi from "koffi";
import { debugLog, log } from "../utils/debugLogger";
import { SendInput } from "./bindings";
import { getPressedKeys, markKeyDown, markKeyUp } from "./pressedKeysTracker";
import { INPUT, INPUT_KEYBOARD, KEYEVENTF_KEYUP } from "./types";

/**
 * キー送信機能
 */

export const sendKey = (vk: number, up: boolean, m?: unknown): void => {
  debugLog("sender.ts-10-sendKey", { vk, up, m });
  log("sendkey", vk, up ? "up" : "down", m);

  // 押下キーを追跡
  if (up) {
    markKeyUp(vk);
  } else {
    markKeyDown(vk);
  }

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
    debugLog("sender.ts-35-SendInput-result", { sent });
    if (sent !== 1) {
      console.error(`SendInput failed. Sent: ${sent}`);
    }
  } catch (e) {
    console.error("SendInput Error:", e);
  }
};

/**
 * すべての押下中キーに対してキーアップを送信
 * @returns リリースしたキーの数
 */
export function releaseAllPressedKeys(): number {
  // 先に配列にコピー（ループ中に sendKey 内で markKeyUp が呼ばれセットが変更されるため）
  const keys = getPressedKeys();
  debugLog("sender.ts-51-releaseAllPressedKeys", keys);
  log("releaseAllPressedKeys", keys);
  for (const vk of keys) {
    sendKey(vk, true, "release-all");
  }
  return keys.length;
}
