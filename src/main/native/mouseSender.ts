import { GetCursorPos, SetCursorPos } from "./bindings";

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
