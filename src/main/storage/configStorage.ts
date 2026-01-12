import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  DEFAULT_REMAP_CONFIG,
  type RemapConfig,
} from "@shared/types/remapConfig";
import { app } from "electron";

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
    console.log(`Loading config from ${this.configPath}`);
    try {
      const data = await readFile(this.configPath, "utf-8");
      this.config = JSON.parse(data) as RemapConfig;
    } catch (_error) {
      console.log("No existing config found. create config.");
      this.config = { ...DEFAULT_REMAP_CONFIG };
      await this.save(this.config);
    }

    // 確実にbaseレイヤーが存在するようにする
    if (!this.config.layers.some((l) => l.id === "base")) {
      this.config.layers.unshift(...DEFAULT_REMAP_CONFIG.layers);
    }

    // layerOrderがない場合は生成（後方互換性）
    if (!this.config.layerOrder) {
      this.config.layerOrder = this.config.layers.map((l) => l.id);
    }

    // globalSettingsがない場合はデフォルト値を設定（後方互換性）
    if (!this.config.globalSettings) {
      this.config.globalSettings = DEFAULT_REMAP_CONFIG.globalSettings;
      console.log("Added default global settings for backward compatibility.");
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
