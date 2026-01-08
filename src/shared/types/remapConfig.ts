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
 * リマップアクション（複数キー対応）
 */
export interface RemapAction {
  type: "remap";
  keys: number[];
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
  // | MacroAction
  | LayerToggleAction
  | LayerMomentaryAction
  | NoneAction;
// | PassthroughAction;

export type ActionType = Action["type"];

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
 * キー別タイミング設定
 */
export interface KeyTimingConfig {
  /** 長押し判定のしきい値（ミリ秒）- 未設定時はグローバル設定を使用 */
  holdThresholdMs?: number;
  /** ダブルタップ判定の間隔（ミリ秒）- 未設定時はグローバル設定を使用 */
  tapIntervalMs?: number;
}

/**
 * レイヤー定義
 */
export interface Layer {
  id: string;
  /** キーコード → バインディング配列 */
  bindings: Record<number, KeyBinding[]>;
  /** "layerMomentary"で有効にしている場合、ほかのキーを押したときにこのキーを送信する */
  passThroughKeys?: number[];
  /** レイヤーアクティブ時にデフォルトで送信する修飾キー（tap アクションが設定されているキーは除外） */
  defaultModifiers?: {
    shift?: boolean | "left" | "right";
  };
  /** キーコード → タイミング設定 */
  keyTimings?: Record<number, KeyTimingConfig>;
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
  /** レイヤーの表示順序（レイヤーIDの配列） */
  layerOrder: string[];
  globalSettings: GlobalSettings;
}

/**
 * デフォルト設定
 */
/** VK_LSHIFT */
const VK_LSHIFT = 160;
/** VK_RSHIFT */
const VK_RSHIFT = 161;

export const DEFAULT_REMAP_CONFIG: RemapConfig = {
  version: 1,
  layers: [
    {
      id: "base",
      bindings: {
        // Shift 長押しで shift レイヤーを有効化
        [VK_LSHIFT]: [
          {
            trigger: "hold",
            action: { type: "layerMomentary", layerId: "shift" },
          },
        ],
        [VK_RSHIFT]: [
          {
            trigger: "hold",
            action: { type: "layerMomentary", layerId: "shift" },
          },
        ],
      },
    },
    {
      id: "shift",
      bindings: {},
      defaultModifiers: { shift: true },
    },
  ] satisfies RemapConfig["layers"],
  layerOrder: ["base", "shift"],
  globalSettings: {
    defaultHoldThresholdMs: 200,
    defaultTapIntervalMs: 300,
  },
};
