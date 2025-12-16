import { setupKeyboardHook } from "../hook";
import { remapRules } from "../state/rules";
import { setupIPCHandlers } from "./handlers";
import type { EventSender } from "./types";

export async function setupRemapper(sender: EventSender) {
  await remapRules.init();
  setupKeyboardHook(sender);
  setupIPCHandlers();
}

// biome-ignore lint/performance/noBarrelFile: 今後ここでラップする可能性がある
export { teardownKeyboardHook as teardownRemapper } from "../hook";
