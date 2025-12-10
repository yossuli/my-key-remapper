import { ipcMain } from "electron";
import { setupKeyboardHook } from "./hook";
import { remapRules } from "./rules";

export async function setupRemapper(
  sender: (channel: string, data: unknown) => void
) {
  await remapRules.init();
  setupKeyboardHook(sender);

  // IPCハンドラ
  ipcMain.handle("get-mappings", () => remapRules.getAll());

  ipcMain.on("add-mapping", (_event, { from, to }) => {
    remapRules.add(from, to);
  });

  ipcMain.on("remove-mapping", (_event, from) => {
    remapRules.remove(from);
  });
}

// biome-ignore lint/performance/noBarrelFile: 今後ここでラップする可能性がある
export { teardownKeyboardHook as teardownRemapper } from "./hook";
