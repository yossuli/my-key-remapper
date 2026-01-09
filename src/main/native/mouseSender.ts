import koffi from "koffi";
import { GetCursorPos, SendInput, SetCursorPos } from "./bindings";
import {
  INPUT,
  INPUT_MOUSE,
  MOUSEEVENTF_LEFTDOWN,
  MOUSEEVENTF_LEFTUP,
  MOUSEEVENTF_MIDDLEDOWN,
  MOUSEEVENTF_MIDDLEUP,
  MOUSEEVENTF_RIGHTDOWN,
  MOUSEEVENTF_RIGHTUP,
} from "./types";

/**
 * 現在のマウスカーソル位置を取得
 * @returns {{ x: number; y: number }} 現在のカーソル位置
 */
export function getCursorPosition(): { x: number; y: number } {
  const point = [{ x: 0, y: 0 }];
  try {
    const success = GetCursorPos(point);
    if (!success) {
      console.error("GetCursorPos failed");
      return { x: 0, y: 0 };
    }
    return { x: point[0].x, y: point[0].y };
  } catch (e) {
    console.error("GetCursorPos Error:", e);
    return { x: 0, y: 0 };
  }
}

/**
 * マウスカーソルを特定座標に移動
 * @param x - X座標 (絶対ピクセル座標)
 * @param y - Y座標 (絶対ピクセル座標)
 */
export function moveMouse(x: number, y: number): void {
  console.log("moveMouse", x, y);

  try {
    const success = SetCursorPos(x, y);
    if (!success) {
      console.error(`SetCursorPos failed for position (${x}, ${y})`);
    }
  } catch (e) {
    console.error("SetCursorPos Error:", e);
  }
}

/**
 * マウスボタンを押す/離す
 * @param button - ボタン種別
 * @param down - true: 押す, false: 離す
 */
export function sendMouseButton(
  button: "left" | "right" | "middle",
  down: boolean
): void {
  try {
    let flags = 0;
    if (button === "left") {
      flags = down ? MOUSEEVENTF_LEFTDOWN : MOUSEEVENTF_LEFTUP;
    } else if (button === "right") {
      flags = down ? MOUSEEVENTF_RIGHTDOWN : MOUSEEVENTF_RIGHTUP;
    } else if (button === "middle") {
      flags = down ? MOUSEEVENTF_MIDDLEDOWN : MOUSEEVENTF_MIDDLEUP;
    }

    const input = {
      type: INPUT_MOUSE,
      u: {
        mi: {
          dx: 0,
          dy: 0,
          mouseData: 0,
          dwFlags: flags,
          time: 0,
          dwExtraInfo: 0,
        },
      },
    };

    const sent = SendInput(1, [input], koffi.sizeof(INPUT));
    if (sent !== 1) {
      console.error(`SendInput failed for mouse button. Sent: ${sent}`);
    }
  } catch (e) {
    console.error("SendInput Mouse Error:", e);
  }
}

/**
 * 特定座標をクリック
 * @param x - X座標
 * @param y - Y座標
 * @param button - ボタン種別
 * @param clickCount - クリック回数
 */
export async function clickAt(
  x: number,
  y: number,
  button: "left" | "right" | "middle",
  clickCount = 1
): Promise<void> {
  console.log("clickAt", x, y, button, clickCount);

  // カーソルを移動
  moveMouse(x, y);

  // クリック回数分実行
  for (let i = 0; i < clickCount; i++) {
    sendMouseButton(button, true); // ボタンを押す
    sendMouseButton(button, false); // ボタンを離す

    // ダブルクリックの場合、少し待つ
    if (i < clickCount - 1) {
      // 次のクリックまで非同期で待つ（50ms）
      // biome-ignore lint/style/noMagicNumbers: クリック間隔
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}
