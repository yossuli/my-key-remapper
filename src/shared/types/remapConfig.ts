// =====================================
// トリガー種別
// =====================================

/**
 * トリガーの種類
 * - tap: 単押し（短押し）
 * - hold: 長押し
 * - doubleTap: ダブルクリック
 * - tapHold: タップ後に長押し
 */
export type TriggerType = "tap" | "hold" | "doubleTap" | "tapHold";

// =====================================
// 修飾キー
// =====================================

/**
 * 修飾キーの出力指定
 */
export interface ModifierOutput {
  ctrl?: boolean | "left" | "right";
  shift?: boolean | "left" | "right";
  alt?: boolean | "left" | "right";
  win?: boolean | "left" | "right";
}

// =====================================
// アクション
// =====================================

/**
 * マクロの1ステップ
 */
export interface MacroStep {
  action: "tap" | "down" | "up" | "delay" | "text";
  key?: number;
  modifiers?: ModifierOutput;
  delayMs?: number;
  text?: string;
}

/**
 * リマップアクション
 */
export interface RemapAction {
  type: "remap";
  key: number;
  modifiers?: ModifierOutput;
}

/**
 * マクロアクション
 */
export interface MacroAction {
  type: "macro";
  steps: MacroStep[];
}

/**
 * レイヤートグルアクション（タップで切り替え）
 */
export interface LayerToggleAction {
  type: "layerToggle";
  layerId: string;
}

/**
 * レイヤーモーメンタリーアクション（押している間だけ有効）
 */
export interface LayerMomentaryAction {
  type: "layerMomentary";
  layerId: string;
}

/**
 * 無効化アクション
 */
export interface NoneAction {
  type: "none";
}

/**
 * パススルーアクション（そのまま通す）
 */
export interface PassthroughAction {
  type: "passthrough";
}

/**
 * すべてのアクション種別
 */
export type Action =
  | RemapAction
  | MacroAction
  | LayerToggleAction
  | LayerMomentaryAction
  | NoneAction
  | PassthroughAction;

// =====================================
// キーバインディング
// =====================================

/**
 * キーバインディング（1つのトリガーに対する1つのアクション）
 */
export interface KeyBinding {
  trigger: TriggerType;
  action: Action;
}

// =====================================
// レイヤー
// =====================================

/**
 * レイヤー定義
 */
export interface Layer {
  id: string;
  name: string;
  /** キーコード → バインディング配列 */
  bindings: Record<number, KeyBinding[]>;
}

// =====================================
// 設定全体
// =====================================

/**
 * グローバル設定
 */
export interface GlobalSettings {
  /** 長押し判定のしきい値（ミリ秒） */
  defaultHoldThresholdMs: number;
  /** ダブルタップ判定の間隔（ミリ秒） */
  defaultTapIntervalMs: number;
}

/**
 * リマップ設定全体
 */
export interface RemapConfig {
  version: number;
  layers: Layer[];
  globalSettings: GlobalSettings;
}

/**
 * デフォルト設定
 */
export const DEFAULT_REMAP_CONFIG: RemapConfig = {
  version: 1,
  layers: [
    {
      id: "base",
      name: "Base",
      bindings: {
        160:[{
          trigger: "hold",
          action: {
            type: "layerMomentary",
            layerId: "shift",
          },
        }]
        ,
        161:[{
          trigger: "hold",
          action: { type: "layerMomentary", layerId: "shift" },
        }]
      },
    },
    {
      id: "shift",
      name: "Shift",
      bindings: {},
    },
  ] satisfies RemapConfig["layers"],
  globalSettings: {
    defaultHoldThresholdMs: 200,
    defaultTapIntervalMs: 300,
  },
};
