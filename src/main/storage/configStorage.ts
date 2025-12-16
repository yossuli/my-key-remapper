import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { app } from "electron";
import {
  DEFAULT_REMAP_CONFIG,
  type RemapConfig,
} from "../../shared/types/remapConfig";

/**
 * 設定の読み書きを担当するクラス
 */
export class ConfigStorage {
  private readonly configPath: string;
  private config: RemapConfig = { ...DEFAULT_REMAP_CONFIG };

  constructor() {
    this.configPath = join(
      app.getPath("userData"),
      "key-mapping-config-v2.json"
    );
  }

  /**
   * 設定をロード（存在しない場合はデフォルトを使用）
   */
  async load(): Promise<RemapConfig> {
    try {
      const data = await readFile(this.configPath, "utf-8");
      this.config = JSON.parse(data) as RemapConfig;
    } catch (_error) {
      console.log("No existing config found, starting with defaults.");
      this.config = { ...DEFAULT_REMAP_CONFIG };
    }

    // 確実にbaseレイヤーが存在するようにする
    if (!this.config.layers.some((l) => l.id === "base")) {
      this.config.layers.unshift(...DEFAULT_REMAP_CONFIG.layers);
    }

    return this.config;
  }

  /**
   * 設定を保存
   */
  async save(newConfig: RemapConfig): Promise<void> {
    this.config = newConfig;
    if (!this.configPath) {
      return;
    }
    try {
      await writeFile(this.configPath, JSON.stringify(this.config, null, 2));
      console.log("Saved config.");
    } catch (error) {
      console.error("Failed to save config:", error);
    }
  }

  /**
   * 現在のキャッシュされた設定を取得
   */
  getConfig(): RemapConfig {
    return this.config;
  }
}

export const configStorage = new ConfigStorage();
