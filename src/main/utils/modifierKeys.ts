/**
 * 修飾キーの定数とユーティリティ
 */

// 修飾キーのVKコード
export const VK_LCTRL = 162;
export const VK_RCTRL = 163;
export const VK_LSHIFT = 160;
export const VK_RSHIFT = 161;
export const VK_LALT = 164;
export const VK_RALT = 165;
export const VK_LWIN = 91;
export const VK_RWIN = 92;

/**
 * 修飾キーのVKコードを取得
 */
export function getModifierVk(
  value: boolean | "left" | "right",
  leftVk: number,
  rightVk: number
): number {
  return value === "right" ? rightVk : leftVk;
}

/**
 * 修飾キーの配列を生成
 */
export function buildModifierKeys(modifiers: {
  ctrl?: boolean | "left" | "right";
  shift?: boolean | "left" | "right";
  alt?: boolean | "left" | "right";
  win?: boolean | "left" | "right";
}): number[] {
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
