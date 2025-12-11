import type { KeyDefinition } from "../types";

export const getKeyLabel = (
  vk: number | [number, number],
  keyboardLayout: KeyDefinition[][]
) => {
  for (const row of keyboardLayout) {
    const found = row.find((k) => {
      if (Array.isArray(k.vk) && Array.isArray(vk)) {
        return k.vk[0] === vk[0] && k.vk[1] === vk[1];
      }
      if (Array.isArray(k.vk) || Array.isArray(vk)) {
        return `${vk}`;
      }
      return k.vk === vk;
    });
    if (found) {
      return found.label;
    }
  }
  return `VK ${vk}`;
};
