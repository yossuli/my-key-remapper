import { setupKeyboardHook } from "../hook";
import { layerState } from "../state/layerState";
import { remapRules } from "../state/rules";
import { setupIPCHandlers } from "./handlers";
import type { EventSender } from "./types";

export async function setupRemapper(sender: EventSender) {
  await remapRules.init();

  // レイヤースタック変更時にフロントエンドへ通知
  layerState.setOnChangeCallback((stack) => {
    sender("layer-stack-changed", { stack });
  });

  setupKeyboardHook(sender);
  setupIPCHandlers();
}

// biome-ignore lint/performance/noBarrelFile: 今後ここでラップする可能性がある
export { teardownKeyboardHook as teardownRemapper } from "../hook";
