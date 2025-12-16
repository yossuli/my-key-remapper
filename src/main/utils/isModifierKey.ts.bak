import { VK } from "../../shared/constants/vk";

/**
 * 修飾キーかどうかを判定
 * 修飾キーは長押し判定を無効化する（Windowsの特殊な動作のため）
 */
export function isModifierKey(vkCode: number): boolean {
  return (
    vkCode === VK.SHIFT ||
    vkCode === VK.CONTROL ||
    vkCode === VK.ALT ||
    vkCode === VK.LWIN ||
    vkCode === VK.RWIN ||
    (vkCode >= VK.LSHIFT && vkCode <= VK.RALT) //
  );
}
