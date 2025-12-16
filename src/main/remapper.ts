import { setupKeyboardHook } from "./hook";
import { setupIPCHandlers } from "./ipc/handlers";
import type { EventSender } from "./ipc/types";
import { remapRules } from "./rules";

export async function setupRemapper(sender: EventSender) {
  await remapRules.init();
  setupKeyboardHook(sender);
  setupIPCHandlers();
}

// biome-ignore lint/performance/noBarrelFile: 今後ここでラップする可能性がある
export { teardownKeyboardHook as teardownRemapper } from "./hook";
