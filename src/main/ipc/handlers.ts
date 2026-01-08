import { ipcMain } from "electron";
import { applyGlobalSettings, setRemapEnabled } from "../hook/keyHandler";
import { getPressedKeys } from "../native/pressedKeysTracker";
import { releaseAllPressedKeys } from "../native/sender";
import { remapRules } from "../state/rules";

/**
 * IPCハンドラの登録
 */

export function setupIPCHandlers(): void {
  // マッピング取得
  ipcMain.handle("get-mappings", () => remapRules.getLayerData());

  // レイヤー順序変更
  ipcMain.on("reorder-layers", (_event, { newOrder }) => {
    remapRules.reorderLayers(newOrder);
  });

  // キー設定保存（バインディング + タイミング）
  ipcMain.on(
    "save-key-config",
    (_event, { layerId, from, binding, timing }) => {
      remapRules.addBinding(layerId, from, binding);
      // timingがnullの場合は設定を削除、undefinedの場合は何もしない、値がある場合は設定
      if (timing === null) {
        remapRules.setKeyTiming(layerId, from, null);
      } else if (timing !== undefined) {
        remapRules.setKeyTiming(layerId, from, timing);
      }
    }
  );

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

  // レイヤースタック取得
  ipcMain.handle("get-layer-stack", () => remapRules.getLayerStack());

  // レイヤー強制リセット
  ipcMain.on("reset-layer", (_event, { layerId }) => {
    remapRules.resetToLayer(layerId);
  });

  // 押下中のキーを取得
  ipcMain.handle("get-pressed-keys", () => getPressedKeys());

  // すべての押下中キーをリリース
  ipcMain.handle("release-all-keys", () => releaseAllPressedKeys());

  // グローバル設定を更新
  ipcMain.on("update-global-settings", (_event, { settings }) => {
    remapRules.updateGlobalSettings(settings);
    // 設定を即座に反映
    applyGlobalSettings();
  });
}
