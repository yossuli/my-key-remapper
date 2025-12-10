import type { KeyDefinition } from "../types";

export const getKeyLabel = (vk: number, keyboardLayout: KeyDefinition[][]) => {
  for (const row of keyboardLayout) {
    const found = row.find((k) => k.vk === vk);
    if (found) {
      return found.label;
    }
  }
  return `VK ${vk}`;
};
