import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_REMAP_CONFIG,
  type GlobalSettings,
} from "../../../shared/types/remapConfig";

/**
 * グローバル設定を管理するカスタムフック
 */
export function useGlobalSettings(): {
  globalSettings: GlobalSettings | null;
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  isLoading: boolean;
} {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // 初期ロード
  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      try {
        const data = await window.electron?.ipcRenderer.invoke("get-mappings");
        // globalSettingsが存在しない場合はデフォルト値を使用（後方互換性）
        setGlobalSettings(
          data.globalSettings ?? DEFAULT_REMAP_CONFIG.globalSettings
        );
      } catch (error) {
        console.error("Failed to load global settings:", error);
        // エラー時もデフォルト値を設定
        setGlobalSettings(DEFAULT_REMAP_CONFIG.globalSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 設定を更新
  const updateGlobalSettings = useCallback(
    (settings: Partial<GlobalSettings>) => {
      window.electron?.ipcRenderer.send("update-global-settings", { settings });
      // ローカルの状態も更新
      setGlobalSettings((prev) =>
        prev ? { ...prev, ...settings } : prev
      );
    },
    []
  );

  return {
    globalSettings,
    updateGlobalSettings,
    isLoading,
  };
}
