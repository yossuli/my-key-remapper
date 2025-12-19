import {
  KEYBOARD_LAYOUT_BASE,
  KEYBOARD_LAYOUT_SHIFT,
  VK,
} from "../../../shared/constants";
import type { KeyboardLayout, LayoutType } from "../types";

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: 諦め
export const getKeyLabel = (vk: number[], layoutType: LayoutType) => {
  if (vk.length === 1) {
    const keyboardLayout: KeyboardLayout = KEYBOARD_LAYOUT_BASE[layoutType];
    for (const { row } of keyboardLayout) {
      const found = row.find((k) => k.vk === vk[0]);
      if (found) {
        return found.label;
      }
    }
    return (
      Object.entries(VK).find(([__dirname, value]) => value === vk[0])?.[0] ??
      `VK ${vk}`
    );
    // biome-ignore lint/style/noUselessElse: 1対1対応なのでelseで良い
  } else {
    const keyboardLayout: KeyboardLayout = KEYBOARD_LAYOUT_SHIFT[layoutType];
    for (const { row } of keyboardLayout) {
      const found = row.find((k) => {
        const a = new Set([k.vk].flat());
        const b = new Set([vk].flat());
        if (a.difference(b).size === 0 && b.difference(a).size === 0) {
          return true;
        }
        return false;
      });
      if (found) {
        return found.label;
      }
    }
    return vk
      .map(
        (k) =>
          Object.entries(VK).find(([__dirname, value]) => value === k)?.[0] ??
          `VK ${k}`
      )
      .join(" + ");
  }
};
