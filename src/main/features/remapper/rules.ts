import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { app } from "electron";
import {
  type Action,
  DEFAULT_REMAP_CONFIG,
  type KeyBinding,
  type Layer,
  type RemapConfig,
  type TriggerType,
} from "../../../shared/types/remapConfig";

/**
 * レイヤーとキーバインディングを管理するクラス
 */
export class RemapRules {
  private config: RemapConfig = { ...DEFAULT_REMAP_CONFIG };
  private configPath = "";

  /** 現在有効なレイヤーのスタック（最後が最優先） */
  private layerStack: string[] = ["base"];

  async init() {
    this.configPath = join(
      app.getPath("userData"),
      "key-mapping-config-v2.json"
    );
    await this.load();
  }

  private async load() {
    try {
      const data = await readFile(this.configPath, "utf-8");
      const json = JSON.parse(data) as RemapConfig;

      this.config = json;
    } catch (_error) {
      console.log("No existing config found, starting with defaults.");
      this.config = { ...DEFAULT_REMAP_CONFIG };
    }

    // 確実にbaseレイヤーが存在するようにする
    if (!this.config.layers.some((l) => l.id === "base")) {
      this.config.layers.unshift(...DEFAULT_REMAP_CONFIG.layers);
    }
  }

  private async save() {
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

  // =====================================
  // レイヤー管理
  // =====================================

  /**
   * レイヤーをスタックにプッシュ（momentary用）
   */
  pushLayer(layerId: string) {
    if (!this.layerStack.includes(layerId)) {
      this.layerStack.push(layerId);
      console.log(`Layer pushed: ${layerId}, stack: ${this.layerStack}`);
    }
  }

  /**
   * レイヤーをスタックからポップ（momentary用）
   */
  popLayer(layerId: string) {
    const index = this.layerStack.indexOf(layerId);
    if (index > 0) {
      // baseレイヤーは削除しない
      this.layerStack.splice(index, 1);
      console.log(`Layer popped: ${layerId}, stack: ${this.layerStack}`);
    }
  }

  /**
   * レイヤーをトグル
   */
  toggleLayer(layerId: string) {
    if (this.layerStack.includes(layerId)) {
      this.popLayer(layerId);
    } else {
      this.pushLayer(layerId);
    }
  }

  /**
   * 現在のレイヤースタックを取得
   */
  getLayerStack(): string[] {
    return [...this.layerStack];
  }

  /**
   * 現在アクティブなレイヤーIDを取得（passThroughKeys判定用）
   */
  getActiveLayerIds(): string[] {
    return [...this.layerStack];
  }

  /**
   * すべてのレイヤーを取得
   */
  getLayers(): Layer[] {
    return this.config.layers;
  }

  /**
   * レイヤーを追加
   */
  addLayer(layer: Layer) {
    if (!this.config.layers.some((l) => l.id === layer.id)) {
      this.config.layers.push(layer);
      this.save();
    }
  }

  /**
   * レイヤーを削除
   */
  removeLayer(layerId: string) {
    if (layerId === "base") {
      return; // baseレイヤーは削除不可
    }
    this.config.layers = this.config.layers.filter((l) => l.id !== layerId);
    this.popLayer(layerId);
    this.save();
  }

  // =====================================
  // バインディング管理
  // =====================================

  /**
   * 指定キーのバインディングを取得（現在有効なレイヤーから優先順に検索）
   */
  getBindings(keyCode: number): KeyBinding[] {
    // レイヤースタックを逆順にして、最優先のレイヤーから検索
    for (let i = this.layerStack.length - 1; i >= 0; i--) {
      const layerId = this.layerStack[i];
      const layer = this.config.layers.find((l) => l.id === layerId);
      if (layer?.bindings[keyCode]) {
        return layer.bindings[keyCode];
      }
    }
    return [];
  }

  /**
   * 指定トリガーに対するアクションを取得
   */
  getAction(keyCode: number, trigger: TriggerType): Action | undefined {
    const bindings = this.getBindings(keyCode);
    const binding = bindings.find((b) => b.trigger === trigger);
    return binding?.action;
  }

  /**
   * 指定レイヤーにバインディングを追加
   */
  addBinding(layerId: string, keyCode: number, binding: KeyBinding) {
    const layer = this.config.layers.find((l) => l.id === layerId);
    if (!layer) {
      return;
    }

    if (!layer.bindings[keyCode]) {
      layer.bindings[keyCode] = [];
    }

    // 同じトリガーのバインディングがあれば上書き
    const existingIndex = layer.bindings[keyCode].findIndex(
      (b) => b.trigger === binding.trigger
    );
    if (existingIndex >= 0) {
      layer.bindings[keyCode][existingIndex] = binding;
    } else {
      layer.bindings[keyCode].push(binding);
    }

    this.save();
  }

  /**
   * 指定レイヤーからバインディングを削除
   */
  removeBinding(layerId: string, keyCode: number, trigger: TriggerType) {
    const layer = this.config.layers.find((l) => l.id === layerId);
    if (!layer?.bindings[keyCode]) {
      return;
    }

    layer.bindings[keyCode] = layer.bindings[keyCode].filter(
      (b) => b.trigger !== trigger
    );

    if (layer.bindings[keyCode].length === 0) {
      delete layer.bindings[keyCode];
    }

    this.save();
  }

  /**
   * 設定全体を取得
   */
  getConfig(): RemapConfig {
    return this.config;
  }

  /**
   * グローバル設定を取得
   */
  getGlobalSettings() {
    return this.config.globalSettings;
  }
}

export const remapRules = new RemapRules();
