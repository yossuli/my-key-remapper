import { ipcMain } from "electron";
import { remapRules } from "../state/rules";

/**
 * IPCハンドラの登録
 */

export function setupIPCHandlers() {
  // マッピング取得
  ipcMain.handle("get-mappings", () => remapRules.getLayers());

  // マッピング追加
  ipcMain.on("add-mapping", (_event, { layerId, from, binding }) => {
    remapRules.addBinding(layerId, from, binding);
  });

  // バインディング削除
  ipcMain.on("remove-binding", (_event, { layerId, from, trigger }) => {
    remapRules.removeBinding(layerId, from, trigger);
  });
}
