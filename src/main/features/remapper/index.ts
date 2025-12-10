import { ipcMain } from "electron";
import { setupKeyboardHook } from "./hook";
import { remapRules } from "./rules";

export function setupRemapper(
  sender: (channel: string, data: unknown) => void
) {
  setupKeyboardHook(sender);

  // IPC Handlers
  ipcMain.handle("get-mappings", () => remapRules.getAll());

  ipcMain.on("add-mapping", (_event, { from, to }) => {
    remapRules.add(from, to);
  });

  ipcMain.on("remove-mapping", (_event, from) => {
    remapRules.remove(from);
  });
}
