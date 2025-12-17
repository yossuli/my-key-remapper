import type {
  Action,
  KeyBinding,
  Layer,
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
    // shiftレイヤーが存在しない場合は自動生成
    this.ensureShiftLayerExists();
  }

  /**
   * shiftレイヤーが存在しない場合に自動生成
   * LSHIFT/RSHIFTのholdトリガーにlayerMomentaryバインディングを設定
   */
  private ensureShiftLayerExists() {
    const config = configStorage.getConfig();
    if (!config.layers.some((l) => l.id === "shift")) {
      config.layers.push({
        id: "shift",
        bindings: {},
      });
    }

    // baseレイヤーにShiftキーのlayerMomentaryバインディングを追加（なければ）
    const baseLayer = config.layers.find((l) => l.id === "base");
    if (baseLayer) {
      const LSHIFT = 160;
      const RSHIFT = 161;
      const shiftBinding = {
        trigger: "hold" as const,
        action: { type: "layerMomentary" as const, layerId: "shift" },
      };

      // LSHIFTにバインディングがなければ追加
      if (!baseLayer.bindings[LSHIFT]?.some((b) => b.trigger === "hold")) {
        baseLayer.bindings[LSHIFT] = [
          ...(baseLayer.bindings[LSHIFT] || []),
          shiftBinding,
        ];
      }

      // RSHIFTにバインディングがなければ追加
      if (!baseLayer.bindings[RSHIFT]?.some((b) => b.trigger === "hold")) {
        baseLayer.bindings[RSHIFT] = [
          ...(baseLayer.bindings[RSHIFT] || []),
          shiftBinding,
        ];
      }
    }

    configStorage.save(config);
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
      configStorage.save(config);
    }
  }

  removeLayer(layerId: string) {
    if (layerId === "base") {
      return;
    }
    const config = configStorage.getConfig();
    config.layers = config.layers.filter((l) => l.id !== layerId);
    layerState.popLayer(layerId);
    configStorage.save(config);
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
   * 指定キーのバインディングを取得（現在有効なレイヤーから優先順に検索）
   */
  getBindings(keyCode: number): KeyBinding[] {
    const stack = layerState.getStack();
    const layers = this.getLayers();

    // レイヤースタックを逆順にして、最優先のレイヤーから検索
    for (let i = stack.length - 1; i >= 0; i--) {
      const layerId = stack[i];
      const layer = layers.find((l) => l.id === layerId);
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
}

export const remapRules = new RemapRules();
