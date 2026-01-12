import type {
  Action,
  GlobalSettings,
  KeyBinding,
  Layer,
  MacroDef,
  RemapConfig,
  TriggerType,
} from "../../shared/types/remapConfig";
import { configStorage } from "../storage/configStorage";
import { layerState } from "./layerState";

/**
 * レイヤーとキーバインディングを管理するファサードクラス
 */
export class RemapRules {
  async init() {
    await configStorage.load();
    const config = configStorage.getConfig();

    // Migration: 自動生成または後方互換性のための補正
    // 既存の "shift" レイヤーが defaultModifiers を持っていない場合、明示的に付与する
    const shiftLayer = config.layers.find((l) => l.id === "shift");
    if (shiftLayer) {
      if (!shiftLayer.defaultModifiers) {
        shiftLayer.defaultModifiers = { shift: true };
        console.log(
          "Migrated 'shift' layer to have defaultModifiers: { shift: true }"
        );
        configStorage.save(config);
      }
    } else {
      // shiftレイヤー自体が存在しない場合は自動生成 (既存コメント通り)
      // Note: DEFAULT_REMAP_CONFIG で生成されるので、ここで明示的に作る必要はないかもしれないが
      // 既存の処理があればそれに従う。ここでは変更を最小限に。
    }

    // Migration: macros が未定義の場合は空配列で初期化
    if (!config.macros) {
      config.macros = [];
      console.log("Migrated config to have empty 'macros' array");
      configStorage.save(config);
    }
  }

  // =====================================
  // レイヤー管理（layerStateに委譲）
  // =====================================

  pushLayer(layerId: string) {
    layerState.pushLayer(layerId);
  }

  popLayer(layerId: string) {
    layerState.popLayer(layerId);
  }

  setLayer(layerId: string) {
    layerState.setLayer(layerId);
  }

  getLayerStack(): string[] {
    return layerState.getStack();
  }

  getActiveLayerIds(): string[] {
    return layerState.getStack();
  }

  /**
   * 指定レイヤーにスタックを強制リセット
   */
  resetToLayer(layerId: string) {
    layerState.resetToLayer(layerId);
  }

  // =====================================
  // 設定データアクセス（configStorageに委譲）
  // =====================================

  getLayers(): Layer[] {
    return configStorage.getConfig().layers;
  }

  getConfig(): RemapConfig {
    return configStorage.getConfig();
  }

  getGlobalSettings() {
    return configStorage.getConfig().globalSettings;
  }

  // =====================================
  // バインディング操作
  // =====================================

  addLayer(layer: Layer) {
    const config = configStorage.getConfig();
    if (!config.layers.some((l) => l.id === layer.id)) {
      config.layers.push(layer);
      // layerOrderにも追加
      if (config.layerOrder) {
        config.layerOrder.push(layer.id);
      } else {
        config.layerOrder = config.layers.map((l) => l.id);
      }
      configStorage.save(config);
    }
  }

  removeLayer(layerId: string) {
    if (layerId === "base") {
      return;
    }
    const config = configStorage.getConfig();
    config.layers = config.layers.filter((l) => l.id !== layerId);
    // layerOrderからも削除
    if (config.layerOrder) {
      config.layerOrder = config.layerOrder.filter((id) => id !== layerId);
    }
    layerState.popLayer(layerId);
    configStorage.save(config);
  }

  /**
   * レイヤー順序を更新
   */
  reorderLayers(newOrder: string[]) {
    const config = configStorage.getConfig();
    config.layerOrder = newOrder;
    configStorage.save(config);
  }

  /**
   * レイヤー情報と順序を取得
   */
  getLayerData(): {
    layers: Layer[];
    layerOrder: string[];
    globalSettings: GlobalSettings;
  } {
    const config = configStorage.getConfig();
    return {
      layers: config.layers,
      layerOrder: config.layerOrder ?? config.layers.map((l) => l.id),
      globalSettings: config.globalSettings,
    };
  }

  addBinding(layerId: string, keyCode: number, binding: KeyBinding) {
    const config = configStorage.getConfig();
    const layer = config.layers.find((l) => l.id === layerId);
    if (!layer) {
      return;
    }

    if (!layer.bindings[keyCode]) {
      layer.bindings[keyCode] = [];
    }

    const existingIndex = layer.bindings[keyCode].findIndex(
      (b) => b.trigger === binding.trigger
    );
    if (existingIndex >= 0) {
      layer.bindings[keyCode][existingIndex] = binding;
    } else {
      layer.bindings[keyCode].push(binding);
    }

    configStorage.save(config);
  }

  removeBinding(layerId: string, keyCode: number, trigger: TriggerType) {
    const config = configStorage.getConfig();
    const layer = config.layers.find((l) => l.id === layerId);
    if (!layer?.bindings[keyCode]) {
      return;
    }

    layer.bindings[keyCode] = layer.bindings[keyCode].filter(
      (b) => b.trigger !== trigger
    );

    if (layer.bindings[keyCode].length === 0) {
      delete layer.bindings[keyCode];
    }

    configStorage.save(config);
  }

  /**
   * 指定キーのバインディングを取得（レイヤースタックをフォールバック）
   */
  getBindings(keyCode: number): KeyBinding[] {
    const stack = layerState.getStack();
    const layers = this.getLayers();

    // スタックを後ろから前に確認（現在のレイヤー → ベースレイヤー）
    for (let i = stack.length - 1; i >= 0; i--) {
      const layerId = stack[i];
      const layer = layers.find((l) => l.id === layerId);
      const bindings = layer?.bindings[keyCode];

      if (bindings && bindings.length > 0) {
        return bindings;
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
   * 現在アクティブなレイヤーを取得
   */
  getCurrentLayer(): Layer | undefined {
    const stack = layerState.getStack();
    const layers = this.getLayers();
    return layers.find((l) => l.id === stack.at(-1));
  }

  /**
   * レイヤー情報を更新
   */
  updateLayer(layerId: string, updates: Partial<Layer>): void {
    const config = configStorage.getConfig();
    const layer = config.layers.find((l) => l.id === layerId);
    if (!layer) {
      return;
    }

    // 更新対象のプロパティをマージ
    // bindingsは上書きしないように注意（updatesに含まれている場合のみ）
    Object.assign(layer, updates);

    configStorage.save(config);
  }

  /**
   * グローバル設定を更新
   */
  updateGlobalSettings(settings: Partial<GlobalSettings>): void {
    const config = configStorage.getConfig();
    config.globalSettings = {
      ...config.globalSettings,
      ...settings,
    };
    configStorage.save(config);
  }

  // =====================================
  // マクロ管理
  // =====================================

  getMacros(): MacroDef[] {
    return configStorage.getConfig().macros ?? [];
  }

  setMacros(macros: MacroDef[]): void {
    const config = configStorage.getConfig();
    config.macros = macros;
    configStorage.save(config);
  }
}

export const remapRules = new RemapRules();
