import koffi from "koffi";
import { SendInput } from "./bindings";
import { INPUT, INPUT_KEYBOARD, KEYEVENTF_KEYUP } from "./types";

/**
 * キー送信機能
 */

export const sendKey = (vk: number, up: boolean, m?: any) => {
  console.log("sendkey", vk, up ? "up" : "down", m);

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
