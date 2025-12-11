import { ipcMain } from "electron";
import { setupKeyboardHook } from "./hook";
import { remapRules } from "./rules";

export async function setupRemapper(
  sender: (channel: string, data: unknown) => void
) {
  await remapRules.init();
  setupKeyboardHook(sender);

  // IPCハンドラ
  ipcMain.handle("get-mappings", () => remapRules.getLayers());

  ipcMain.on("add-mapping", (_event, { layerId, from, binding }) => {
    remapRules.addBinding(layerId, from, binding);
  });

  ipcMain.on("remove-binding", (_event, { layerId, from, trigger }) => {
    remapRules.removeBinding(layerId, from, trigger);
  });
}

// biome-ignore lint/performance/noBarrelFile: 今後ここでラップする可能性がある
export { teardownKeyboardHook as teardownRemapper } from "./hook";
