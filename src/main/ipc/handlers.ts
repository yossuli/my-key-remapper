import { ipcMain } from "electron";
import { setRemapEnabled } from "../hook/keyHandler";
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

  // レイヤー追加
  ipcMain.on("add-layer", (_event, { layerId }) => {
    remapRules.addLayer({ id: layerId, bindings: {} });
  });

  // レイヤー削除
  ipcMain.on("remove-layer", (_event, { layerId }) => {
    remapRules.removeLayer(layerId);
  });

  // リマップ有効/無効設定
  ipcMain.on("set-remap-enabled", (_event, { enabled }) => {
    setRemapEnabled(enabled);
  });
}
