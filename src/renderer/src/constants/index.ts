/** biome-ignore-all lint/style/noExportedImports: このファイルは 集約するためのファイル */
/** biome-ignore-all lint/performance/noBarrelFile: このファイルは 集約するためのファイル */
import type { KeyDefinition, LayoutType } from "../types";

import { KEYBOARD_LAYOUT_JIS } from "./JIS";
import { KEYBOARD_LAYOUT_US } from "./US";

export const KEY_SIZE_REM = 3;

export const KEYBOARD_LAYOUT = {
  JIS: KEYBOARD_LAYOUT_JIS,
  US: KEYBOARD_LAYOUT_US,
} as const satisfies Record<LayoutType, KeyDefinition[][]>;

export const SWITCH_LAYOUT_RULE = {
  JIS: "US",
  US: "JIS",
} as const;

export { KEYBOARD_LAYOUT_JIS };
export { KEYBOARD_LAYOUT_US };
export { VK } from "./vk";
