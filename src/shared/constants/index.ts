import type { KeyboardLayout, LayerType, LayoutType } from "../types";

import { KEYBOARD_LAYOUT_JIS, KEYBOARD_LAYOUT_JIS_CUSTOM } from "./JIS";
import { KEYBOARD_LAYOUT_US, KEYBOARD_LAYOUT_US_CUSTOM } from "./US";

export const KEY_SIZE_REM = 3;

const KEYBOARD_LAYOUT_BASE = {
  JIS: KEYBOARD_LAYOUT_JIS,
  US: KEYBOARD_LAYOUT_US,
} as const satisfies Record<LayoutType, KeyboardLayout>;

const KEY_0BOARD_LAYOUT_CUSTOM = {
  JIS: KEYBOARD_LAYOUT_JIS_CUSTOM,
  US: KEYBOARD_LAYOUT_US_CUSTOM,
} as const satisfies Record<LayoutType, KeyboardLayout>;

export const KEYBOARD_LAYOUT = {
  base: KEYBOARD_LAYOUT_BASE,
  custom: KEY_0BOARD_LAYOUT_CUSTOM,
} as const satisfies Record<LayerType, Record<LayoutType, KeyboardLayout>>;

export const SWITCH_LAYOUT_RULE = {
  JIS: "US",
  US: "JIS",
} as const satisfies Record<LayoutType, LayoutType>;

export const LAYER_TYPES = ["base", "custom"] as const satisfies LayerType[];

// biome-ignore lint/performance/noBarrelFile: ここは許容
export { VK } from "./vk";
