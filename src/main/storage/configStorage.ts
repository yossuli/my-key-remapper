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
  private readonly macroPath: string;
  private config: RemapConfig = { ...DEFAULT_REMAP_CONFIG };

  constructor() {
    const userDataPath = app.getPath("userData");
    this.configPath = join(userDataPath, "key-mapping-config-v2.json");
    this.macroPath = join(userDataPath, "key-mapping-macros-v2.json");
  }

  /**
   * 設定をロード（存在しない場合はデフォルトを使用）
   */
  async load(): Promise<RemapConfig> {
    console.log(`Loading config from ${this.configPath}`);

    // 1. メイン設定の読み込み
    try {
      const data = await readFile(this.configPath, "utf-8");
      this.config = JSON.parse(data) as RemapConfig;
    } catch (_error) {
      console.log("No existing config found. create config.");
      this.config = { ...DEFAULT_REMAP_CONFIG };
      await this.save(this.config);
    }

    // 2. マクロ設定の読み込み
    try {
      const macroData = await readFile(this.macroPath, "utf-8");
      this.config.macros = JSON.parse(macroData);
    } catch (_error) {
      console.log("No existing macros found. create macros config.");
      this.config.macros = [];
      await this.saveMacros(this.config.macros);
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
   * 設定を保存 (マクロ以外)
   */
  async save(newConfig: RemapConfig): Promise<void> {
    this.config = newConfig;
    if (!this.configPath) {
      return;
    }

    const { macros: _, ...persistentConfig } = newConfig;

    try {
      await writeFile(
        this.configPath,
        JSON.stringify(persistentConfig, null, 2)
      );
      console.log("Saved remap config");
    } catch (error) {
      console.error("Failed to save remap config:", error);
    }
  }

  /**
   * マクロ設定のみを保存
   */
  async saveMacros(macros: RemapConfig["macros"]): Promise<void> {
    this.config.macros = macros;
    try {
      await writeFile(this.macroPath, JSON.stringify(macros, null, 2));
      console.log("Saved macros config");
    } catch (error) {
      console.error("Failed to save macros config:", error);
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
